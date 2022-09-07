import { DistancePoint, generateDistanceMatrix } from './distanceMatrices'
import { Point, PointBounds, Rectangle } from './types'
import { isPointInside } from './utils'

/**
 * The cluster generator.
 *
 * A cluster holds the distances between all of the points
 * in a wrap-around world.
 *
 * @typeParam T The type of a point.
 */
export class ClusterGenerator<T> {
  /** For each point, the distance to and index of, the other points */
  private distanceMatrix: DistancePoint[][] = []
  /** The point getter */
  private getPoint: (points: T) => Point

  /** The array of points */
  public points: T[]

  /**
   * Create a cluster.
   *
   * @param points An array of points.
   * @param getPoint A point getter.
   * @param rectangle A rectangle that constrains the point.
   * @param calcDistance A function with calculates the distance between two points.
   */
  constructor(
    points: T[],
    getPoint: (points: T) => Point,
    rectangle: Rectangle,
    calcDistance: (a: Point, b: Point) => number
  ) {
    this.points = points
    this.getPoint = getPoint
    this.distanceMatrix = generateDistanceMatrix(
      points,
      getPoint,
      rectangle,
      calcDistance
    )
  }

  /**
   * Find points less than or equal to a given distance away.
   *
   * @param index The index of the point in the original array.
   * @param distance The maximum distance.
   * @returns An array of points.
   */
  within(index: number, distance: number): T[] {
    return this.distanceMatrix[index]
      .slice(1)
      .filter(v => v.distance <= distance)
      .map(v => this.points[v.index])
  }

  range(bounds: PointBounds): T[] {
    return this.points.filter(p => isPointInside(this.getPoint(p), bounds))
  }
}
