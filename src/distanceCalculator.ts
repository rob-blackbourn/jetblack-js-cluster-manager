import { Point } from './types'

/**
 * Calculate the Manhattan distance between two points.
 *
 * @param a A point.
 * @param b Another point.
 * @returns The distance between the two points.
 */
export function calcManhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

/**
 * Calculate the Euclidean distance between two points.
 *
 * @param a A point
 * @param b Another point.
 * @returns The distance between two points.
 */
export function calcEuclideanDistance(a: Point, b: Point): number {
  const x = a.x - b.x
  const y = a.y - b.y
  return Math.sqrt(x * x + y * y)
}
