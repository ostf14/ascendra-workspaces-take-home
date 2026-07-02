// Design notes catalog — the "walkable case study" surfaces in the product
// via the meta-bar toggle. Each note has a stable id, a data-note attribute
// living on some element in the product tree, and a link to the decision
// record that goes deeper.
//
// The catalog order = the pin number. Note #4 is always #4 across the
// product, even on pages where earlier notes aren't visible. Same shape as
// footnotes in a book — the number is the note's identity.
//
// To add a new note:
//  1. Append an entry to DESIGN_NOTES (do not reorder — that shifts numbers
//     for reviewers reading between sessions)
//  2. Add `data-note="<id>"` to the anchor element in the product tree
//  3. Point `decisionFile` at the closest supporting decision record

export type DesignNote = {
  id: string;
  title: string;
  excerpt: string;
  decisionFile: string; // repo-relative path, e.g. "decisions/03-actionable-waste.md"
};

const REPO = "https://github.com/ostf14/ascendra-workspaces-take-home";
const BRANCH = "main";

export function decisionUrl(note: DesignNote): string {
  return `${REPO}/blob/${BRANCH}/${note.decisionFile}`;
}

export const DESIGN_NOTES: DesignNote[] = [
  {
    id: "persona-switcher",
    title: "Persona switcher, not tab nav",
    excerpt:
      "Two audiences share one product. A meta-bar reads as OS chrome — whose eyes am I looking through — instead of framing admin and developer as peer sections of one app.",
    decisionFile: "decisions/01-role-based-navigation.md",
  },
  {
    id: "waste-card",
    title: "Waste-first admin overview",
    excerpt:
      "Most admin dashboards open with a metrics grid — that's a passive read. The waste card puts the money leak on line one with an inline action. Metrics come after.",
    decisionFile: "decisions/03-actionable-waste.md",
  },
  {
    id: "cost-card",
    title: "Six numbers into two stories",
    excerpt:
      "The overview used to have six equal HeroMetric cards. Regrouped into two semantic cards (Cost this month, Fleet health) because the six numbers belong to two stories, and grouping surfaces them.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "cpu-distribution",
    title: "Distribution as a decision surface",
    excerpt:
      "The histogram used to be five horizontal bars — accurate but neutral. Rebuilt as vertical bars with semantic zone bands plus a three-row action ribbon underneath, tying shape to money to a next action.",
    decisionFile: "decisions/03-actionable-waste.md",
  },
  {
    id: "connect-methods",
    title: "Three connect methods, not one",
    excerpt:
      "The brief says 'Open in IDE.' Coder / Gitpod / Codespaces all support three: browser IDE, VS Code Desktop with Remote SSH, plain SSH. Locking developers into browser-only would be a real product regression.",
    decisionFile: "decisions/02-connect-methods.md",
  },
  {
    id: "master-detail",
    title: "State as truth, URL as mirror",
    excerpt:
      "Selection lives in React state; the URL is mirrored via history.replaceState. This bypasses Next.js router coalescing so rapid clicks never drop selections — the panel updates every time.",
    decisionFile: "decisions/04-state-and-persistence.md",
  },
  {
    id: "idle-indicator",
    title: "Idle is a modifier, not a status",
    excerpt:
      "A running-but-quiet workspace is still running. Idle became inline text next to the status pill — no background, no icon — so the status field stays a status field.",
    decisionFile: "decisions/03-actionable-waste.md",
  },
  {
    id: "compact-time",
    title: "Density lives in the small choices",
    excerpt:
      "'about 3 hours ago' wraps and breaks column alignment. '3h' does not. Same information; the compact form pays back every row, every glance.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "templates-edit",
    title: "In-place edit, not a page",
    excerpt:
      "Editing a template used to navigate to a standalone form. That broke the master-detail flow every time you saved. In-panel edit keeps the list on screen and returns you to view mode after Save.",
    decisionFile: "decisions/04-state-and-persistence.md",
  },
  {
    id: "palette",
    title: "Cool blue, softened statuses",
    excerpt:
      "Reuses the systemic layer from my reader project — type scale, spacing grid, radii, weight rules — but diverges on the palette: cool off-white neutrals plus pinkish red for error, warm orange for pending. Less alarmist for a tool you look at all day.",
    decisionFile: "decisions/05-design-direction.md",
  },
];

export function pinNumber(id: string): number | null {
  const i = DESIGN_NOTES.findIndex((n) => n.id === id);
  return i === -1 ? null : i + 1;
}
