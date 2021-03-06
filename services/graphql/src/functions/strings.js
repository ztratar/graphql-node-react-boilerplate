export const joinWithAnd = (strings = [], stringEnd = 'and') => {
  if (!strings.length) return '';
  if (strings.length < 2) return strings[0];
  const firstStrings = strings.slice(0, strings.length - 1);
  return firstStrings.join(', ') + ' ' + stringEnd + ' ' + strings[strings.length - 1];
};
