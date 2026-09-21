import { useLingui } from "@lingui/react/macro";
import { useUIStore } from "../../stores/uiStore";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Button } from "./Button";
import { PanelRightClose } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Popover générique réutilisable
 * @param {string} id - identifiant unique (pour le store UI)
 * @param {React.ReactNode} trigger - élément déclencheur (bouton, icône...)
 * @param {React.ReactNode} children - contenu du popover
 * @param {string} position - position: 'right', 'left', 'center' (default: 'right')
 * @param {boolean} showCloseButton - afficher le bouton X (default: true)
 */
export function Popover({
  id,
  trigger,
  children,
  position = "right",
  showCloseButton = true,
  width = "w-96",
}) {
  const { t } = useLingui();
  const { openUi, closeUi } = useUIStore();
  const isOpen = useUIStore((state) => state.UserInterfaces[id]) || false;

  const ref = useClickOutside(() => closeUi(id), isOpen);

  const positionClass = {
    right: "right-0",
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
  }[position];

  return (
    <div className="relative " ref={ref}>
      <div onClick={() => openUi(id)}>{trigger}</div>
      {/* Popover Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }} // Entre de droite
            animate={{ x: 0, opacity: 1 }} // Position finale
            exit={{ x: 400, opacity: 0 }} // Sort vers droite
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className={`fixed ${positionClass} ${width} top-5 bottom-5 bg-[var(--color-surface)] z-50 rounded-lg shadow-3xl border border-[var(--color-border)] overflow-hidden text-[var(--color-text)]`}
          >
            {/* Header avec close button */}
            {showCloseButton && (
              <Button
                onClick={() => closeUi(id)}
                className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded transition"
                variant="primary"
                icon={PanelRightClose}
                title={t`Fermer popover`}
                aria-label={t`Fermer popover`}
              />
            )}
            {/* Contenu */}
            <div className="p-6 h-full overflow-y-auto">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}