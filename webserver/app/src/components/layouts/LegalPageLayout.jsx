import { Trans, useLingui } from '@lingui/react/macro';

/**
 * Layout partagé par les pages légales (confidentialité, CGU) : titre,
 * date de mise à jour, bandeau de contexte, sommaire ancré + contenu.
 * `sections` sert à générer le sommaire — doit correspondre aux `id`
 * passés aux <LegalSection> à l'intérieur.
 */
export function LegalPageLayout({ title, lastUpdated, sections, children }) {
  const { t } = useLingui();

  return (
    <div className="bg-[var(--color-bg)]">
      <div className="container py-10 sm:py-14">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-2">{title}</h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          <Trans>Dernière mise à jour : {lastUpdated}</Trans>
        </p>

        <div className="mb-10 p-4 bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm text-[var(--color-text-muted)]">
          <Trans>
            TheGoodCorner est un projet réalisé dans le cadre du projet de formation "ft_transcendence" du cursus de l'école 42-Paris. Il n'a pas
            de valeur commerciale réelle, mais cette page est rédigée dans des conditions proches du réel pour
            les besoins de l'exercice.
          </Trans>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
          <nav aria-label={t`Sommaire`} className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              <Trans>Sommaire</Trans>
            </p>
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-10 pb-16">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Une section du document. `id` doit matcher l'entrée correspondante dans
 * `sections` (LegalPageLayout) pour que le sommaire fonctionne.
 * `scroll-mt-24` compense la navbar sticky au clic sur un lien d'ancre.
 */
export function LegalSection({ id, title, children }) {
  return (
    <section id={id} className={'scroll-mt-24'}>
      <h2 className="text-xl font-bold text-[var(--color-text)] mb-3">{title}</h2>
      <div className="text-sm text-[var(--color-text)] leading-relaxed space-y-3">{children}</div>
    </section>
  );
}