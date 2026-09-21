import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useLingui } from '@lingui/react/macro';
import { LegalPageLayout, LegalSection } from '../components/layouts/LegalPageLayout';

function PrivacyPolicy() {
  const { t } = useLingui();

  const sections = useMemo(
    () => [
      { id: 'qui-sommes-nous', label: t`Qui sommes-nous` },
      { id: 'donnees-collectees', label: t`Données que nous collectons` },
      { id: 'finalites', label: t`Pourquoi nous les utilisons` },
      { id: 'base-legale', label: t`Base légale` },
      { id: 'destinataires', label: t`Qui y a accès` },
      { id: 'conservation', label: t`Durée de conservation` },
      { id: 'cookies', label: t`Cookies et stockage local` },
      { id: 'droits', label: t`Vos droits` },
      { id: 'securite', label: t`Sécurité` },
      { id: 'mineurs', label: t`Âge minimum` },
      { id: 'modifications', label: t`Modifications` },
      { id: 'contact', label: t`Contact` },
    ],
    [t]
  );

  return (
    <LegalPageLayout
      title={t`Politique de confidentialité`}
      lastUpdated={t`31 août 2026`}
      sections={sections}
    >
      <LegalSection id="qui-sommes-nous" title={t`Qui sommes-nous`}>
        <p>
          <Trans>
            TheGoodCorner est une marketplace qui met en relation des particuliers pour l'achat et la vente
            d'articles d'occasion (matériel de sport, entraînement, combat...). Cette politique explique quelles
            données nous collectons lorsque vous utilisez le site, pourquoi, et quels droits vous pouvez exercer.
          </Trans>
        </p>
        <p>
          <Trans>
            Pour toute question sur vos données personnelles, vous pouvez nous écrire à{' '}
            <a href="mailto:contact@thegoodcorner.fr" className="text-[var(--color-primary)] hover:underline">
              contact@thegoodcorner.fr
            </a>
            .
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="donnees-collectees" title={t`Données que nous collectons`}>
        <p>
          <Trans>Selon votre usage du site, nous collectons :</Trans>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Trans>
              <strong>Données de compte</strong> : email, mot de passe (jamais stocké en clair), nom d'utilisateur.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Données de profil (optionnelles)</strong> : numéro de téléphone, adresse (pays, région, ville, rue, numéro, complément), photo de profil, biographie.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Données liées à votre activité</strong> : produits que vous publiez (nom, description, prix, catégorie, photo), avis que vous laissez à d'autres utilisateurs (note, commentaire), messages échangés avec d'autres membres via la messagerie.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Données techniques</strong> : préférence de thème (clair/sombre), contenu de votre panier, aperçu de vos conversations — stockées localement dans votre navigateur (voir la section Cookies ci-dessous).
            </Trans>
          </li>
        </ul>
        <p>
          <Trans>
            Nous ne collectons aucune donnée bancaire : le paiement en ligne n'est pas encore disponible sur la
            plateforme à ce stade du projet (voir les{' '}
            <Link to="/conditions-generales#fonctionnement" className="text-[var(--color-primary)] hover:underline">
              CGU
            </Link>
            ).
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="finalites" title={t`Pourquoi nous les utilisons`}>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Trans>Créer et gérer votre compte, vous authentifier.</Trans>
          </li>
          <li>
            <Trans>Vous permettre de publier des annonces, laisser des avis et échanger des messages avec d'autres utilisateurs.</Trans>
          </li>
          <li>
            <Trans>Afficher votre profil vendeur (public) aux autres membres.</Trans>
          </li>
          <li>
            <Trans>Mémoriser vos préférences (thème, panier) pour une expérience plus fluide.</Trans>
          </li>
        </ul>
        <p>
          <Trans>Nous n'utilisons pas vos données à des fins de prospection commerciale, de publicité ciblée ou de revente à des tiers.</Trans>
        </p>
      </LegalSection>

      <LegalSection id="base-legale" title={t`Base légale`}>
        <p>
          <Trans>
            Le traitement de vos données repose sur l'exécution du contrat qui nous lie (création de compte,
            utilisation des fonctionnalités de la marketplace) et, pour le stockage local non essentiel
            (thème, panier), sur votre consentement implicite à l'usage du site.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="destinataires" title={t`Qui y a accès`}>
        <p>
          <Trans>
            Votre email, votre adresse et votre numéro de téléphone ne sont jamais visibles par les autres
            utilisateurs. Seul votre profil public est visible des autres membres : nom d'utilisateur, avatar,
            biographie, note vendeur, et produits que vous avez publiés.
          </Trans>
        </p>
        <p>
          <Trans>Vos données ne sont partagées avec aucun prestataire publicitaire ou analytique tiers.</Trans>
        </p>
      </LegalSection>

      <LegalSection id="conservation" title={t`Durée de conservation`}>
        <p>
          <Trans>
            Vos données sont conservées tant que votre compte est actif. Vous pouvez supprimer votre compte à
            tout moment depuis votre page Profil ; vos données de profil sont alors effacées. Pour toute question
            sur le devenir d'un contenu que vous avez publié et qui concerne d'autres utilisateurs (avis, messages),
            contactez-nous.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="cookies" title={t`Cookies et stockage local`}>
        <p>
          <Trans>
            Nous utilisons un seul cookie, strictement nécessaire au fonctionnement du site, ainsi que le
            stockage local de votre navigateur (localStorage) pour le confort d'usage :
          </Trans>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
            <thead>
              <tr className="bg-[var(--color-surface-hover)] text-left">
                <th className="p-2 font-semibold">
                  <Trans>Nom</Trans>
                </th>
                <th className="p-2 font-semibold">
                  <Trans>Type</Trans>
                </th>
                <th className="p-2 font-semibold">
                  <Trans>Finalité</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2">
                  <Trans>Cookie de rafraîchissement</Trans>
                </td>
                <td className="p-2">
                  <Trans>Cookie httpOnly (essentiel)</Trans>
                </td>
                <td className="p-2">
                  <Trans>Garder votre session connectée sans redemander votre mot de passe</Trans>
                </td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2">has_session</td>
                <td className="p-2">localStorage</td>
                <td className="p-2">
                  <Trans>Savoir si une session est potentiellement active au chargement</Trans>
                </td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2">theme-storage</td>
                <td className="p-2">localStorage</td>
                <td className="p-2">
                  <Trans>Mémoriser le thème clair/sombre choisi</Trans>
                </td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2">cart-storage</td>
                <td className="p-2">localStorage</td>
                <td className="p-2">
                  <Trans>Conserver le contenu de votre panier entre deux visites</Trans>
                </td>
              </tr>
              <tr className="border-t border-[var(--color-border)]">
                <td className="p-2">message-storage</td>
                <td className="p-2">localStorage</td>
                <td className="p-2">
                  <Trans>Afficher rapidement l'aperçu de vos conversations au chargement de la messagerie</Trans>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          <Trans>
            Votre jeton d'authentification n'est, quant à lui, jamais stocké dans le navigateur : il vit
            uniquement en mémoire le temps de votre session et est régénéré via le cookie de rafraîchissement.
          </Trans>
        </p>
        <p>
          <Trans>Vous pouvez effacer ces données à tout moment depuis les paramètres de votre navigateur.</Trans>
        </p>
      </LegalSection>

      <LegalSection id="droits" title={t`Vos droits`}>
        <p>
          <Trans>Conformément au RGPD, vous disposez des droits suivants sur vos données :</Trans>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Trans>
              <strong>Accès et rectification</strong> : modifiables directement depuis votre page Profil.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Effacement</strong> : suppression de votre compte via requette à un administrateur de TGC France (via le mail ci-dessous).
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Opposition et limitation</strong> du traitement.
            </Trans>
          </li>
          <li>
            <Trans>
              <strong>Portabilité</strong> de vos données.
            </Trans>
          </li>
        </ul>
        <p>
          <Trans>
            Pour exercer ces droits, contactez-nous à{' '}
            <a href="mailto:contact@thegoodcorner.fr" className="text-[var(--color-primary)] hover:underline">
              contact@thegoodcorner.fr
            </a>
            . Vous disposez également d'un droit de réclamation auprès de la{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
              CNIL
            </a>
            .
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="securite" title={t`Sécurité`}>
        <p>
          <Trans>
            Votre mot de passe est haché avant stockage — personne, pas même notre équipe, n'y a accès en
            clair. La connexion s'appuie sur un jeton de courte durée renouvelé via un cookie sécurisé
            (httpOnly), non accessible en JavaScript.
          </Trans>
        </p>
      </LegalSection>

      <LegalSection id="mineurs" title={t`Âge minimum`}>
        <p>
          <Trans>Le service est réservé aux personnes majeures (18 ans et plus).</Trans>
        </p>
      </LegalSection>

      <LegalSection id="modifications" title={t`Modifications`}>
        <p>
          <Trans>Cette politique peut évoluer. La date de dernière mise à jour est indiquée en haut de cette page.</Trans>
        </p>
      </LegalSection>

      <LegalSection id="contact" title={t`Contact`}>
        <p>
          <Trans>
            Une question sur vos données ?{' '}
            <a href="mailto:contact@thegoodcorner.fr" className="text-[var(--color-primary)] hover:underline">
              contact@thegoodcorner.fr
            </a>
          </Trans>
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}

export default PrivacyPolicy;