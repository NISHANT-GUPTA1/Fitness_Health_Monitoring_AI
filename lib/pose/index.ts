/**
 * Index file for pose estimation library
 * Easy imports from @/lib/pose
 */

export { createPose } from "./pose";
export type { Results } from "./pose";

export { calculateAngle, calculateDistance, isVisible } from "./angles";
export type { Point3D } from "./angles";

export {
  squatRule,
  pushUpRule,
  plankRule,
  checkExerciseForm,
  POSE_LANDMARKS,
} from "./rules";
export type { FeedbackResult } from "./rules";

export {
  RepCounter,
  SquatCounter,
  PushUpCounter,
  SitUpCounter,
} from "./repCounter";
export type { ExercisePhase, RepCounterState } from "./repCounter";
