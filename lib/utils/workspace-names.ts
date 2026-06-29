// Coder-style: <adjective>-<animal>-<two-digit>. Names give the product
// a system-generated voice rather than asking the user for one.

export const NAME_ADJECTIVES = [
  "amber",
  "ancient",
  "azure",
  "brave",
  "bright",
  "calm",
  "clever",
  "cosmic",
  "crimson",
  "dapper",
  "deep",
  "emerald",
  "fierce",
  "frosty",
  "gentle",
  "golden",
  "honest",
  "jolly",
  "lonely",
  "lucky",
  "merry",
  "mighty",
  "noble",
  "patient",
  "quiet",
  "quick",
  "silver",
  "stale",
  "swift",
  "tidy",
  "valiant",
  "wild",
] as const;

export const NAME_ANIMALS = [
  "badger",
  "beaver",
  "cobra",
  "coyote",
  "dolphin",
  "eagle",
  "falcon",
  "fox",
  "gecko",
  "gibbon",
  "hawk",
  "heron",
  "hippo",
  "ibis",
  "jaguar",
  "lemur",
  "lynx",
  "marmot",
  "mole",
  "moose",
  "newt",
  "orca",
  "otter",
  "owl",
  "panther",
  "raccoon",
  "raven",
  "tapir",
  "tiger",
  "weasel",
] as const;

export type WorkspaceNameRng = () => number;

function pick<T>(rng: WorkspaceNameRng, source: readonly T[]): T {
  if (source.length === 0) {
    throw new Error("Cannot pick from empty source");
  }
  const index = Math.floor(rng() * source.length);
  const item = source[Math.min(index, source.length - 1)];
  if (item === undefined) {
    throw new Error("Pick produced undefined");
  }
  return item;
}

export function generateWorkspaceName(rng: WorkspaceNameRng = Math.random): string {
  const adjective = pick(rng, NAME_ADJECTIVES);
  const animal = pick(rng, NAME_ANIMALS);
  const number = String(10 + Math.floor(rng() * 90)).padStart(2, "0");
  return `${adjective}-${animal}-${number}`;
}

export function generateUniqueWorkspaceName(
  taken: ReadonlySet<string>,
  rng: WorkspaceNameRng = Math.random
): string {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const name = generateWorkspaceName(rng);
    if (!taken.has(name)) return name;
  }
  return `${generateWorkspaceName(rng)}-${Math.floor(rng() * 10_000)
    .toString()
    .padStart(4, "0")}`;
}
