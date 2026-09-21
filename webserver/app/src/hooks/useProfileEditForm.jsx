import { useState, useEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useUserStore } from '../stores/userStore';

/**
 * Encapsule le mode édition du profil (ProfilHeader + ProfilInfos) :
 * état d'édition, valeurs des champs modifiables, sauvegarde via
 * userStore.updateProfile (PUT /user/:id).
 *
 * Champs branchés : email, téléphone, bio, adresse complète (location),
 * et l'avatar (upload via multer, voir userController.ts —
 * uploadMiddleware.single('image')).
 */
function buildFormFromUser(user) {
  return {
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    bio: user?.bio || '',
    location: {
      country: user?.location?.country || '',
      region: user?.location?.region || '',
      city: user?.location?.city || '',
      street: user?.location?.street || '',
      house_number: user?.location?.houseNumber != null ? String(user.location.houseNumber) : '',
      additionnal_infos: user?.location?.additionnal_infos || '',
    },
  };
}

const LOCATION_REQUIRED_FIELDS = ['country', 'region', 'city', 'street', 'house_number'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 Mo — ajuste si ton uploadMiddleware a une autre limite

export function useProfileEditForm() {
  const { t } = useLingui();
  const user = useUserStore((state) => state.user);
  const updateProfile = useUserStore((state) => state.updateProfile);
  const storeError = useUserStore((state) => state.error);
  const clearStoreError = useUserStore((state) => state.clearError);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => buildFormFromUser(user));
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Fichier avatar en attente + son URL de prévisualisation (blob: local,
  // tant que rien n'est encore sauvegardé).
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Tant qu'on n'édite pas, le formulaire reste synchro avec le profil
  // (user qui arrive après le refresh initial, ou juste après une
  // sauvegarde réussie).
  useEffect(() => {
    if (!isEditing) setForm(buildFormFromUser(user));
  }, [user, isEditing]);

  const resetAvatarSelection = () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const startEditing = () => {
    setForm(buildFormFromUser(user));
    resetAvatarSelection();
    setValidationError(null);
    clearStoreError();
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setForm(buildFormFromUser(user));
    resetAvatarSelection();
    setValidationError(null);
    clearStoreError();
    setIsEditing(false);
  };

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (validationError) setValidationError(null);
    if (storeError) clearStoreError();
  };

  const handleLocationChange = (field) => (e) => {
    setForm((f) => ({ ...f, location: { ...f.location, [field]: e.target.value } }));
    if (validationError) setValidationError(null);
    if (storeError) clearStoreError();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de reprendre le même fichier plus tard si besoin
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setValidationError(t`Le fichier doit être une image (PNG ou JPEG).`);
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setValidationError(t`Image trop lourde (5 Mo max).`);
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setValidationError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const save = async () => {
    if (!form.email.trim()) {
      setValidationError(t`L'email ne peut pas être vide.`);
      return;
    }

    // Même règle que le backend (updateUser.ts) : optionnel, mais si
    // renseigné, exactement 10 chiffres.
    const phoneDigits = form.phoneNumber.replace(/\D/g, '');
    if (form.phoneNumber.trim() !== '' && phoneDigits.length !== 10) {
      setValidationError(t`Numéro de téléphone invalide (10 chiffres requis).`);
      return;
    }

    const loc = form.location;
    const filledLocationFields = LOCATION_REQUIRED_FIELDS.filter((key) => loc[key].trim() !== '');
    const hasAnyLocationField = filledLocationFields.length > 0;
    const hasAllLocationFields = filledLocationFields.length === LOCATION_REQUIRED_FIELDS.length;

    if (hasAnyLocationField && !hasAllLocationFields) {
      setValidationError(
        t`Adresse incomplète : remplis tous les champs (pays, région, ville, rue, numéro), ou laisse-les tous vides.`
      );
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    try {
      const payload = {
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        bio: form.bio.trim(),
      };

      if (hasAllLocationFields) {
        // Stringifié ici : FormData ne sait pas transporter un objet
        // imbriqué, le backend fait JSON.parse(body.location) de son côté.
        payload.location = JSON.stringify({
          country: loc.country.trim(),
          region: loc.region.trim(),
          city: loc.city.trim(),
          street: loc.street.trim(),
          house_number: loc.house_number.trim(),
          additionnal_infos: loc.additionnal_infos.trim(),
        });
      }

      if (avatarFile) {
        // La clé DOIT être `image` : c'est le nom attendu par
        // uploadMiddleware.single('image') côté route PUT /user/:id.
        payload.image = avatarFile;
      }

      await updateProfile(payload);
      resetAvatarSelection();
      setIsEditing(false);
    } catch {
      // Erreur déjà posée dans userStore.error par updateProfile — on
      // garde la photo sélectionnée pour ne pas faire tout re-choisir en
      // cas d'échec dû à un autre champ.
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    isEditing,
    form,
    submitting,
    error: validationError || storeError,
    avatarSrc: avatarPreview || user?.avatar,
    startEditing,
    cancelEditing,
    handleChange,
    handleLocationChange,
    handleAvatarChange,
    save,
  };
}
