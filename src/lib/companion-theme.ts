export const themeReactionDuration = 3000;

export function themeReactionPhase(light: boolean, elapsed: number) {
  if (elapsed < 0) return "waiting";
  if (elapsed >= themeReactionDuration) return null;
  if (light) {
    if (elapsed < 550) return "squint";
    if (elapsed < 1100) return "shade";
    if (elapsed < 2100) return "put-on";
    return "cool";
  }
  if (elapsed < 650) return "confused";
  if (elapsed < 1650) return "peek";
  if (elapsed < 2450) return "take-off";
  return "settle";
}

// Face anchors in the existing 80 x 64 atlas, including its squash and side views.
// x/y are the upper-left of the glasses; scale compresses the side-facing frames.
export const glassesAnchors: readonly (readonly [number, number, number, number])[] = [
  [24, 32, 1, 0], [24, 30, 1, 0], [24, 35, 1, 0], [24, 37, 1, 0], [24, 31, 1, 0], [24, 32, 1, 0],
  [36, 31, .75, 0], [37, 30, .75, 0], [37, 29, .75, 0], [36, 31, .75, 0],
  [36, 31, .75, 0], [37, 29, .75, 0], [36, 30, .75, 0], [36, 31, .75, 0],
  [25, 31, 1, 0], [22, 28, 1, 0], [24, 28, 1, 0], [22, 28, 1, 0], [24, 28, 1, 0], [25, 30, 1, 0], [25, 31, 1, 0],
  [37, 31, .75, 0], [41, 33, .75, 15], [41, 40, .75, 20], [37, 31, .75, 0],
  [24, 29, 1, 0], [24, 29, 1, 0], [24, 37, 1, 0], [24, 32, 1, 0],
];
