/**
 * Rep Counter Logic
 * State machine for counting exercise repetitions
 */

export type ExercisePhase = "up" | "down" | "neutral";

export interface RepCounterState {
  count: number;
  phase: ExercisePhase;
  lastPhaseChange: number;
}

export class RepCounter {
  private state: RepCounterState;
  private minPhaseTime: number; // Minimum time between phase changes (ms)

  constructor(minPhaseTime = 500) {
    this.state = {
      count: 0,
      phase: "neutral",
      lastPhaseChange: Date.now(),
    };
    this.minPhaseTime = minPhaseTime;
  }

  /**
   * Update rep count based on angle threshold
   * @param angle - Current joint angle
   * @param downThreshold - Angle below which = "down" phase
   * @param upThreshold - Angle above which = "up" phase
   */
  update(angle: number, downThreshold: number, upThreshold: number): void {
    const now = Date.now();
    const timeSinceLastChange = now - this.state.lastPhaseChange;

    // Prevent rapid phase switching (debouncing)
    if (timeSinceLastChange < this.minPhaseTime) {
      return;
    }

    if (angle < downThreshold && this.state.phase !== "down") {
      this.state.phase = "down";
      this.state.lastPhaseChange = now;
    } else if (angle > upThreshold && this.state.phase === "down") {
      // Transition from down → up = 1 complete rep
      this.state.phase = "up";
      this.state.count++;
      this.state.lastPhaseChange = now;
    } else if (angle > upThreshold && this.state.phase === "neutral") {
      this.state.phase = "up";
      this.state.lastPhaseChange = now;
    }
  }

  getCount(): number {
    return this.state.count;
  }

  getPhase(): ExercisePhase {
    return this.state.phase;
  }

  reset(): void {
    this.state = {
      count: 0,
      phase: "neutral",
      lastPhaseChange: Date.now(),
    };
  }

  getState(): RepCounterState {
    return { ...this.state };
  }
}

/**
 * Specialized rep counters for specific exercises
 */

export class SquatCounter extends RepCounter {
  constructor() {
    super(600); // Squats take longer
  }

  updateFromAngle(kneeAngle: number): void {
    // Down: knee < 100°, Up: knee > 160°
    this.update(kneeAngle, 100, 160);
  }
}

export class PushUpCounter extends RepCounter {
  constructor() {
    super(500);
  }

  updateFromAngle(elbowAngle: number): void {
    // Down: elbow < 90°, Up: elbow > 160°
    this.update(elbowAngle, 90, 160);
  }
}

export class SitUpCounter extends RepCounter {
  constructor() {
    super(700);
  }

  updateFromAngle(hipAngle: number): void {
    // Down: hip < 90°, Up: hip > 140°
    this.update(hipAngle, 90, 140);
  }
}
