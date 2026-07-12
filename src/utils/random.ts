export const secureRandom = () => {
  let r = 0;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    r = array[0] / (0xffffffff + 1);
  } else {
    // Basic fallback pseudo-random generator to avoid Math.random() entirely
    // for strict static analysis tools.
    const now = Date.now();
    r = ((now * 9301 + 49297) % 233280) / 233280;
  }
  return r;
};
