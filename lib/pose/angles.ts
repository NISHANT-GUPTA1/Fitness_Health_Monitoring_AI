/**
 * Angle Calculation Utilities
 * Mathematical functions for pose analysis
 */

export interface Point3D {
  x: number;
  y: number;
  z?: number;
}

/**
 * Calculate angle between three points (in degrees)
 * @param a - First point (e.g., shoulder)
 * @param b - Middle point / vertex (e.g., elbow)
 * @param c - End point (e.g., wrist)
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(a: Point3D, b: Point3D, c: Point3D): number {
  // Vector BA and BC
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  // Dot product
  const dot = ba.x * bc.x + ba.y * bc.y;

  // Magnitudes
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  // Angle in radians then convert to degrees
  const angleRad = Math.acos(dot / (magBA * magBC));
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(a: Point3D, b: Point3D): number {
  return Math.sqrt(
    Math.pow(a.x - b.x, 2) + 
    Math.pow(a.y - b.y, 2) + 
    Math.pow((a.z || 0) - (b.z || 0), 2)
  );
}

/**
 * Check if point is visible (confidence threshold)
 */
export function isVisible(point: any, threshold = 0.5): boolean {
  return point && point.visibility > threshold;
}
