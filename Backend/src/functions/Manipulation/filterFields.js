export function filterFields(data, allowedFields) {
    const filtered = {};
    for (const key of allowedFields) {
      if (key in data) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  }
  