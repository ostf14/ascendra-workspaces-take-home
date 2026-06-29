// Deterministic PRNG so seeded mock data renders the same on every reload.
// mulberry32 — small, fast, good enough for visualization seeding.
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function randomBetween(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}

export function randomInt(rng: () => number, minInclusive: number, maxInclusive: number): number {
  return Math.floor(randomBetween(rng, minInclusive, maxInclusive + 1));
}

export function pickOne<T>(rng: () => number, list: readonly T[]): T {
  if (list.length === 0) throw new Error("Cannot pick from empty list");
  const item = list[Math.min(Math.floor(rng() * list.length), list.length - 1)];
  if (item === undefined) throw new Error("Pick produced undefined");
  return item;
}
