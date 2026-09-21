import React, { useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import { LegalPageLayout, LegalSection } from '../components/layouts/LegalPageLayout';

function TermsOfService() {
  const { t } = useLingui();

  const sections = useMemo(
    () => [
      { id: 'objet', label: t`Objet` },
      { id: 'acceptation', label: t`Acceptation` },
      { id: 'inscription', label: t`Inscription et compte` },
      { id: 'fonctionnement', label: t`Fonctionnement de la marketplace` },
      { id: 'avis', label: t`Avis et évaluations` },
      { id: 'messagerie', label: t`Messagerie` },
      { id: 'contenus-interdits', label: t`Contenus interdits` },
      { id: 'responsabilite', label: t`Responsabilité` },
      { id: 'propriete-intellectuelle', label: t`Propriété intellectuelle` },
      { id: 'suspension', label: t`Suspension et résiliation` },
      { id: 'modification-cgu', label: t`Modification des CGU` },
      { id: 'droit-applicable', label: t`Droit applicable` },
      { id: 'contact', label: t`Contact` },
    ],
    [t]
  );

  return (
    <LegalPageLayout
      title={t`Conditions générales d'utilisation`}
      lastUpdated={t`31 août 2026`}
      sections={sections}
    >
      <LegalSection id="objet" title={t`Objet`}>
        <p>
          <Trans>
            TheGoodCorner est une plateforme qui met en relation des particuliers souhaitant vendre ou acheter
            des articles d'occasion. TheGoodCorner agit comme intermédiaire technique et n'est partie à aucune
            transaction conclue entre utilisateurs.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="acceptation" title={t`Acceptation`}>
        <p>
          <Trans>
            L'utilisation du site implique l'acceptation pleine et entière des présentes conditions générales
            d'utilisation (CGU). La navigation et la consultation des annonces sont libres ; la création d'un
            compte est nécessaire pour vendre, laisser un avis ou envoyer un message.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="inscription" title={t`Inscription et compte`}>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Trans>Le service est réservé aux personnes majeures (18 ans et plus).</Trans>
          </li>
          <li>
            <Trans>Vous vous engagez à fournir des informations exactes lors de votre inscription.</Trans>
          </li>
          <li>
            <Trans>
              Un compte est personnel : vous êtes responsable de la confidentialité de votre mot de passe et de toute activité effectuée depuis votre compte.
            </Trans>
          </li>
          <li>
            <Trans>Le mot de passe doit comporter au minimum 6 caractères.</Trans>
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="fonctionnement" title={t`Fonctionnement de la marketplace`}>
        <p>
          <Trans>
            <strong>En tant que vendeur</strong>, vous pouvez publier une annonce (nom, description, catégorie, prix, photo). Le prix d'un produit ne peut excéder 10 000 €. Vous êtes seul responsable de l'exactitude de votre annonce et de la conformité de l'article proposé.
          </Trans>
        </p>
        <p>
          <Trans>
            <strong>En tant qu'acheteur</strong>, vous pouvez ajouter des articles à votre panier et contacter le vendeur via la messagerie intégrée. Le site empêche techniquement l'achat de votre propre produit.
          </Trans>
        </p>
        <p>
          <Trans>
            <strong>Paiement :</strong> le paiement en ligne n'est pas encore disponible sur la plateforme à ce
            stade du projet. Le bouton « Procéder au paiement » est présent à titre d'aperçu de l'expérience
            finale mais n'est connecté à aucun prestataire de paiement, et aucune donnée bancaire n'est
            collectée ou traitée par TheGoodCorner actuellement. Les modalités d'échange et de remise de
            l'article sont, pour l'instant, à organiser directement entre l'acheteur et le vendeur via la
            messagerie.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="avis" title={t`Avis et évaluations`}>
        <p>
          <Trans>
            Vous pouvez laisser un avis (note et commentaire) sur le profil d'un vendeur avec qui vous n'avez
            pas encore d'avis existant — un seul avis par vendeur et par utilisateur. Les avis doivent être
            honnêtes, refléter une expérience réelle, et ne pas être diffamatoires, injurieux ou trompeurs. Vous
            pouvez modifier ou supprimer un avis que vous avez publié à tout moment.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="messagerie" title={t`Messagerie`}>
        <p>
          <Trans>
            La messagerie sert à échanger avec d'autres utilisateurs dans le cadre d'une transaction. Vous vous
            engagez à un usage loyal : pas de harcèlement, de contenu illicite ou de sollicitation commerciale
            non liée à la plateforme. Vos messages restent privés entre vous et votre interlocuteur.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="contenus-interdits" title={t`Contenus interdits`}>
        <p>
          <Trans>
            Sont notamment interdits : la vente d'articles illégaux ou contrefaits, tout contenu injurieux, discriminatoire ou diffamatoire, ainsi que l'usurpation d'identité.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="responsabilite" title={t`Responsabilité`}>
        <p>
          <Trans>
            TheGoodCorner est un intermédiaire technique et n'est pas partie aux transactions entre utilisateurs.
            Nous n'endossons ni la qualité, ni la légalité, ni la conformité des articles proposés à la vente. En
            cas de litige entre un acheteur et un vendeur, il appartient aux parties de le résoudre entre elles ;
            nous restons joignables pour vous assister en cas de manquement grave aux présentes CGU.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="propriete-intellectuelle" title={t`Propriété intellectuelle`}>
        <p>
          <Trans>
            Le code, le design et la marque TheGoodCorner sont la propriété de l'équipe du projet. Les photos et
            descriptions que vous publiez restent votre propriété ; en les publiant, vous accordez à TheGoodCorner
            le droit de les afficher sur la plateforme dans le cadre de son fonctionnement normal.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="suspension" title={t`Suspension et résiliation`}>
        <p>
          <Trans>
            Nous pouvons suspendre ou supprimer un compte en cas de non-respect manifeste des présentes CGU. Vous
            pouvez, de votre côté, supprimer votre compte via une requette à un administrateur de TGC France via le mail suivant :{' '}
            <a href="mailto:contact@thegoodcorner.fr" className="text-[var(--color-primary)] hover:underline">
              contact@thegoodcorner.fr
            </a>
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="modification-cgu" title={t`Modification des CGU`}>
        <p>
          <Trans>Ces CGU peuvent évoluer. La date de dernière mise à jour est indiquée en haut de cette page.</Trans>
        </p>
      </LegalSection>

      <LegalSection id="droit-applicable" title={t`Droit applicable`}>
        <p>
          <Trans>Les présentes CGU sont soumises au droit français.</Trans>
        </p>
      </LegalSection>

      <LegalSection id="contact" title={t`Contact`}>
        <p>
          <Trans>
            Une question sur ces conditions ?{' '}
            <a href="mailto:contact@thegoodcorner.fr" className="text-[var(--color-primary)] hover:underline">
              contact@thegoodcorner.fr
            </a>
          </Trans>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

export default TermsOfService;