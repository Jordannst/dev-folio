export const companionPoses = {
  idle: { offset: 0, durations: [350, 160, 80, 90, 100, 900] },
  walk: { offset: 6, durations: [160, 160, 160, 160, 160, 160, 160, 160] },
  wave: { offset: 14, durations: [120, 160, 180, 160, 220, 650, 250] },
  curious: { offset: 21, durations: [650, 650, 450, 850] },
  drag: { offset: 25, durations: [220, 220] },
  land: { offset: 27, durations: [140, 260] },
};
export type CompanionPose = keyof typeof companionPoses;
export type CompanionState = {
  version: 1;
  pose: CompanionPose;
  frame: number;
  xRatio: number;
  liftRatio: number;
  direction: number;
  elapsed: number;
  age: number;
  cooldown: number;
  idleDelay: number;
  velocity: number;
};

export function readCompanionState(raw: string | null): CompanionState | null {
  try {
    const state = JSON.parse(raw ?? "null") as CompanionState | null;
    if (!state || state.version !== 1 || !Object.hasOwn(companionPoses, state.pose)) return null;
    const numbers = [state.frame, state.xRatio, state.liftRatio, state.elapsed, state.age, state.cooldown, state.idleDelay, state.velocity];
    if (!numbers.every(value => typeof value === "number" && Number.isFinite(value) && value >= 0)) return null;
    const durations = companionPoses[state.pose].durations;
    if (!Number.isInteger(state.frame) || state.frame >= durations.length || state.elapsed >= durations[state.frame]) return null;
    if (state.xRatio > 1 || state.liftRatio > 1 || ![-1, 1].includes(state.direction)) return null;
    if (state.cooldown > 30000 || state.idleDelay > 10000 || state.velocity > 10) return null;
    return state;
  } catch { return null; }
}
