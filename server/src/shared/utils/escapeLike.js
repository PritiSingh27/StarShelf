export const escapeLike = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/[%_\\]/g, '\\$&');
};
