import React, { useMemo } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';

export default function Faq() {
  const { t } = useLingui();

  const faqSections = useMemo(
    () => [
      { id: 'general', label: t`Généralités` },
      { id: 'compte', label: t`Compte & Inscription` },
      { id: 'annonces', label: t`Acheter & Vendre` },
      { id: 'paiement', label: t`Paiement & Sécurité` },
      { id: 'messagerie', label: t`Messagerie & Notifications` },
      { id: 'contact', label: t`Support & Contact` },
    ],
    [t]
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[color:var(--color-text-muted)] py-12 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Titre principal */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[color:var(--color-text)] mb-2">
          <Trans>Foire aux questions (FAQ)</Trans>
        </h1>
        <p className="text-sm text-[color:var(--color-text-muted)] mb-6">
          <Trans>Dernière mise à jour : 8 septembre 2026</Trans>
        </p>

        {/* Encadré avertissement */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-4 mb-12 text-sm text-[color:var(--color-text-muted)]">
          <Trans>
            TheGoodCorner est un projet réalisé dans le cadre de la formation "ft_transcendence" du cursus de l'école 42-Paris. Les questions-réponses ci-dessous illustrent les fonctionnalités disponibles sur cette version d'évaluation.
          </Trans>
        </div>

        {/* Grille : Sommaire (gauche) + Contenu (droite) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Sommaire sticky */}
          <aside className="hidden md:block col-span-1">
            <nav className="sticky top-8 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
                <Trans>SOMMAIRE</Trans>
              </span>
              <ul className="space-y-2 mt-3 text-sm">
                {faqSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)] transition-colors duration-150 block py-0.5"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Contenu principal */}
          <main className="col-span-1 md:col-span-3 space-y-10">
            {/* Section 1 */}
            <section id="general" className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                <Trans>Généralités</Trans>
              </h2>
              <div className="space-y-3">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Qu'est-ce que TheGoodCorner ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    TheGoodCorner est une plateforme de marketplace en ligne permettant à des particuliers d'acheter et de vendre des articles de seconde main, ainsi que d'échanger en temps réel via une messagerie intégrée.
                  </Trans>
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Le site fonctionne-t-il sans connexion Internet ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    Grâce à notre Service Worker intégré, le site dispose d'une résilience hors-ligne. Vous pouvez continuer à consulter les pages mises en cache et un écran de secours s'affiche si la connexion au serveur est totalement rompue.
                  </Trans>
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="compte" className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                <Trans>Compte & Inscription</Trans>
              </h2>
              <div className="space-y-3">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>La création de compte est-elle obligatoire ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    La navigation sur la liste des annonces est publique. En revanche, un compte personnel est nécessaire pour déposer un article, ajouter un favori, discuter avec un vendeur ou laisser une évaluation.
                  </Trans>
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Quelles sont les exigences pour le mot de passe ?</Trans>
                </h3>
                <ul className="list-disc list-inside text-sm text-[color:var(--color-text-muted)] space-y-1">
                  <li>
                    <Trans>Longueur minimale de 6 caractères.</Trans>
                  </li>
                  <li>
                    <Trans>Adresse e-mail valide requise à l'inscription.</Trans>
                  </li>
                  <li>
                    <Trans>Possibilité d'activer l'authentification à double facteur (2FA) dans les paramètres.</Trans>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="annonces" className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                <Trans>Acheter & Vendre</Trans>
              </h2>
              <div className="space-y-3">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Comment déposer une annonce ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    Une fois connecté, rendez-vous sur votre profil ou sur la page Produits pour remplir le formulaire d'ajout (nom du produit, prix, catégorie, description et photo de couverture).
                  </Trans>
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Puis-je acheter mon propre article ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    Non, la plateforme bloque techniquement la commande et l'ajout au panier pour les annonces dont vous êtes vous-même l'auteur.
                  </Trans>
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section id="paiement" className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                <Trans>Paiement & Sécurité</Trans>
              </h2>
              <div className="space-y-3">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Comment fonctionnent les paiements ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    Le système intègre un tunnel de test (ex: Stripe sandbox ou solde virtuel de portefeuille). Aucune vraie coordonnée bancaire n'est débitée. La remise de l'article peut également s'organiser en main propre via le chat.
                  </Trans>
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section id="messagerie" className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                <Trans>Messagerie & Notifications</Trans>
              </h2>
              <div className="space-y-3">
                <h3 className="text-base font-medium text-[color:var(--color-text)]">
                  <Trans>Les messages sont-ils instantanés ?</Trans>
                </h3>
                <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                  <Trans>
                    Oui, la messagerie et les alertes d'évaluation exploitent des websockets (Socket.IO). Vous recevez les nouveaux messages et mises à jour de statut utilisateur en direct sans avoir à rafraîchir la page.
                  </Trans>
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section id="contact" className="space-y-4">
              <h2 className="text-xl font-semibold text-[color:var(--color-text)]">
                <Trans>Support & Contact</Trans>
              </h2>
              <p className="text-sm text-[color:var(--color-text-muted)] leading-relaxed">
                <Trans>
                  Une question supplémentaire sur le projet ? Contactez l'équipe de développement à l'adresse :{' '}
                  <a
                    href="mailto:contact@thegoodcorner.fr"
                    className="text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-hover)] transition-colors"
                  >
                    contact@thegoodcorner.fr
                  </a>
                  .
                </Trans>
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}