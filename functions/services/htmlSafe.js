function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

// Use for meta values inserted into HTML attributes/content
function sanitizeMeta(value) {
  return escapeHtml(value);
}

module.exports = {
  escapeHtml,
  sanitizeMeta,
};

