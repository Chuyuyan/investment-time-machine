// Single source of truth: the design deliverables at the project root.
// Vite imports JSON natively; these files stay at root so content and code
// never drift apart.
import campaign from '../campaign.json';
import whys from '../whys.json';

export { campaign, whys };

// Convenience lookups built once at module load.
export const motivationsById = Object.fromEntries(whys.motivations.map((m) => [m.id, m]));
export const contextsByName = Object.fromEntries(whys.contexts.map((c) => [c.context, c]));
export const familiesById = Object.fromEntries(whys.families.map((f) => [f.id, f]));
