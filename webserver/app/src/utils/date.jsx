
export function formatMessageTime(dateString) {
  if (!dateString)
    return '';
  return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatConversationTime(dateString) {
  if (!dateString)
    return '';
  const date = new Date(dateString);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

// "mars 2026" — utilisé pour "Membre depuis..." (Profile, SellerProfile)
// et les dates d'avis (ReviewCard), même format partout.
export function formatMonthYear(dateString) {
  if (!dateString)
    return null;
  return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
}