import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useAuthStore } from '../stores/authStore';

/**
 * Encapsule toute la logique du formulaire login/register : état des champs,
 * validation, soumission. Login.jsx ne fait plus que du rendu.
 *
 * Volontairement en dehors de Zustand : rien ici n'a besoin d'être partagé
 * avec le reste de l'app, et on ne veut surtout pas que `form` (donc le mot
 * de passe tapé) finisse sérialisé dans localStorage via le persist d'authStore.
 */
export function useLoginForm() {
  const { t } = useLingui();
  const { login, register, error, setError } = useAuthStore();

  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '', code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const isRegister = mode === 'register';

  const handleChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (error) setError(null);
  };

  const switchMode = () => {
    setError(null);
    setRequiresTwoFactor(false);
    setForm({ username: '', email: '', password: '', code: '' });
    setMode((m) => (m === 'login' ? 'register' : 'login'));
  };

  const validate = () => {
    if (isRegister && !form.username.trim()) return t`Choisis un nom d'utilisateur.`;
    if (!form.email.trim()) return t`Merci de renseigner ton email.`;
    if (!form.password) return t`Merci de renseigner ton mot de passe.`;
    if (form.password.length < 6) return t`Le mot de passe doit faire au moins 6 caractères.`;
    return null;
  };

  /**
   * @param {Function} onSuccess - appelé après une connexion/inscription réussie
   *   (la navigation reste la responsabilité de la page, pas du hook).
   */
  const submit = async (onSuccess) => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setIsShaking(true);
      return;
    }

    setSubmitting(true);

    const success = isRegister
        ? await register(form.email, form.password, form.username.trim())
        : await login(form.email, form.password, form.code);

      setSubmitting(false);
      
      if (success === 'two-factor') {
        setRequiresTwoFactor(true);
      } else if (success) {
        onSuccess?.();
      }
  };

  return {
    isRegister,
    requiresTwoFactor,
    form,
    submitting,
    isShaking,
    error,
    handleChange,
    switchMode,
    submit,
    clearShake: () => setIsShaking(false),
  };
}
