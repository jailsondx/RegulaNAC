export function convertObjectToUpperCase(obj) {
  const uppercasedData = {};

  for (const [key, value] of Object.entries(obj)) {
    uppercasedData[key] = typeof value === 'string' ? value.toUpperCase() : value;
  }

  return uppercasedData;
}
