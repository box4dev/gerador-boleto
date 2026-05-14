export interface Rng {
  next(): number;
}

export const mathRandom: Rng = {
  next() {
    return Math.random();
  },
};

export function randomInt(min: number, max: number, rng: Rng = mathRandom): number {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(rng.next() * (hi - lo + 1)) + lo;
}
