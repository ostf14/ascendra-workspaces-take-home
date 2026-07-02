// Design notes catalog — the "walkable case study" surfaces in the product
// via the meta-bar toggle. Each note has a stable id, a data-note attribute
// living on some element in the product tree, and a link to the decision
// record that goes deeper.
//
// The catalog order = the pin number. Note #4 is always #4 across the
// product, even on pages where earlier notes aren't visible. Same shape as
// footnotes in a book — the number is the note's identity.
//
// The catalog is the source of truth. JSX matches it, not the other way
// around: `id` here is the exact string that must appear as
// `data-note="<id>"` on the anchor element in the product tree.
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
    title: "Persona switcher on meta-layer",
    excerpt:
      "The demo user has both engineer and admin roles. If admin is a nav section, the two personas look like tabs of the same product. Moving the switcher to a meta-bar with 'Viewing as' language makes it clear you're changing whose eyes you look through. Single-role users never see this bar.",
    decisionFile: "decisions/01-role-based-navigation.md",
  },
  {
    id: "waste-primacy",
    title: "Waste card above hero metrics",
    excerpt:
      "Most admin dashboards open with a metrics grid, and admins read past it. People come to this page to find money leaks. Putting the leak in one line with the action attached, above everything else, is the reason the tool earns its rent.",
    decisionFile: "decisions/03-actionable-waste.md",
  },
  {
    id: "cost-grouping",
    title: "Cost as one story, not three metrics",
    excerpt:
      "Hourly, month-to-date, and projected are three moments of the same question: how much are we spending. Putting them in one card with dividers reads as continuation. Three separate cards would read as three independent numbers competing for attention.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "distribution-histogram",
    title: "Hybrid histogram with decision surface",
    excerpt:
      "The first pass was five horizontal bars. Accurate, hard to read. Vertical histogram with zone bands makes the bimodal shape obvious at a glance. The rows below turn that shape into three concrete actions the admin can take today.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "connect-methods",
    title: "Three connect methods",
    excerpt:
      "The brief says 'Open in IDE.' In the category — Coder, Gitpod, Codespaces — every product supports three: browser IDE, VS Code Desktop over SSH, plain SSH. Picking one for the user removes a real feature. The Open popover shows all three.",
    decisionFile: "decisions/02-connect-methods.md",
  },
  {
    id: "master-detail-dev",
    title: "Master-detail on the developer surface",
    excerpt:
      "Most developers have between one and five workspaces and switch between them often. A grid plus separate detail route means a click for every switch. The permanent right panel keeps the current workspace visible while you scan the list. The URL param exists so back-forward and shared links behave normally.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "idle-text-modifier",
    title: "Idle is a modifier, not a status",
    excerpt:
      "Status pills carry running, stopped, starting — states of the machine itself. Idle describes how a running machine is being used. Putting it inline as text after the pill ('· Idle 38h') keeps the pill honest about state and lets the modifier sit where modifiers belong.",
    decisionFile: "decisions/04-state-and-persistence.md",
  },
  {
    id: "session-cost-strip",
    title: "Session cost hero, Rate contextual",
    excerpt:
      "For an admin looking at a workspace, session cost is the answer to 'how much has this uptime cost so far.' Rate is the per-hour tariff. Session cost gets the larger treatment. They share one row because a two-column layout overflowed the panel width on the narrower breakpoints.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "template-inline-edit",
    title: "Template edit lives in the panel",
    excerpt:
      "A modal for editing a template would interrupt the flow. The list on the left is useful reference while you edit — 'we already have a template like this' happens often. The panel swaps to a form on Edit and swaps back on Save or Cancel.",
    decisionFile: "decisions/05-design-direction.md",
  },
  {
    id: "cool-neutrals-palette",
    title: "Cool neutrals over warm cream",
    excerpt:
      "My earlier reading product (remargin.dev) uses warm cream. That palette clashes with cool blue accent in an operational tool. I ran a color audit of Integrity, a workspace tool in a neighboring category, and switched surfaces to cool off-whites with softened status colors. The typography, spacing grid, and radii still travel between products.",
    decisionFile: "decisions/05-design-direction.md",
  },
];

export function pinNumber(id: string): number | null {
  const i = DESIGN_NOTES.findIndex((n) => n.id === id);
  return i === -1 ? null : i + 1;
}
