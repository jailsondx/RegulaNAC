export function convertObjectToUpperCase(obj: Record<string, any>): Record<string, any> {
  const uppercasedData: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    uppercasedData[key] = typeof value === 'string' ? value.toUpperCase() : value;
  }

  return uppercasedData;
}