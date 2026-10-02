/** Keep the entire sprite canvas inside the rails, floor, and visible screen. */
export function clampCompanion(x: number, lift: number, width: number, floor: number, petWidth: number, petHeight: number) {
  return {
    x: Math.max(0, Math.min(x, Math.max(0, width - petWidth))),
    lift: Math.max(0, Math.min(lift, Math.max(0, floor - petHeight))),
  };
}
