// The design catalog. Adding a design: add its entry here, then its folder and route group (see CLAUDE.md at the workspace root).
export const designs = [
  { id: "classic", name: "Classic", description: "Kolom editorial, Instrument Serif dan Inter." },
  { id: "dot-matrix", name: "Dot Matrix", description: "Lanskap pixel, huruf Doto, gerak bertahap." },
] as const;

export type DesignId = (typeof designs)[number]["id"];
export const defaultDesign: DesignId = "classic";

export const isDesignId = (value: unknown): value is DesignId => designs.some(design => design.id === value);
export const resolveDesign = (value: unknown): DesignId => isDesignId(value) ? value : defaultDesign;
