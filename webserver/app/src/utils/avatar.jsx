// Petits helpers partagés pour l'avatar "initiales" utilisé partout où on
// affiche un vendeur sans photo de profil.

export function getInitials(name) {
  return name
    ?.split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

const AVATAR_COLORS = [
  'bg-slate-400',
  'bg-stone-400',
  'bg-zinc-400',
  'bg-gray-400',
  'bg-slate-300',
  'bg-stone-300',
];

export function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}