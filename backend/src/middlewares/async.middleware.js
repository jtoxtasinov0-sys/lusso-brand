// Async kontrollerlardagi xatolik serverni to'xtatib qo'ymasligi uchun o'ram
export function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// Butun kontroller faylini bir yo'la o'rab beradi
export function wrapAll(controllers) {
  const wrapped = {};
  for (const [key, value] of Object.entries(controllers)) {
    wrapped[key] = typeof value === 'function' ? wrap(value) : value;
  }
  return wrapped;
}

export default wrap;
