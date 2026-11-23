export function canAccess(document, userId) {
  const id = String(userId);
  return String(document.owner) === id ||
    document.collaborators.some(person => String(person) === id);
}
