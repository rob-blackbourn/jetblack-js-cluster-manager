import { Point, Rectangle, Size } from './types'

/** The index of a given point and it's distance from another point */
export interface DistancePoint {
  /** The index of the point */
  index: number
  /** The distance from another point */
  distance: number
}

/**
 * Adjust a point by an offset. If the point lies outside
 * the width of the rectangle, adjust it by wrapping around.
 *
 * @param point A point.
 * @param offset An offset, by which to adjust the point.
 * @param width The width of the rectangle.
 * @returns The adjusted point.
 */
function adjustPoint(point: Point, offset: Point, width: number): Point {
  const x = point.x + offset.x
  return {
    x: x < 0 ? x + width : x >= width ? x - width : x,
    y: point.y + offset.y
  }
}

/**
 * Calculate the offset from the target point to the center
 * in order to shift the other points around it.
 *
 * @param targetPoint The target point.
 * @param rectangleCenter The center of the target point in the rectangle.
 * @returns The offset.
 */
function calcCenterOffset(targetPoint: Point, rectangleCenter: Point): Point {
  return {
    x: rectangleCenter.x - targetPoint.x,
    y: rectangleCenter.y - targetPoint.y
  }
}

/**
 * Calculate the center of the rectangle, shifted such that the
 * top left is at x=0, y=0.
 *
 * @param rectangle A rectangle
 * @returns A point representing the center of the rectangle.
 */
function calcRectangleCenter(rectangle: Rectangle): Point {
  return {
    x: -rectangle.x + rectangle.width / 2,
    y: -rectangle.y + rectangle.height / 2
  }
}

/**
 * Create a square matrix to hold the distance between points.
 *
 * @param count The number of points.
 * @returns A matrix of index and distance where distance is NaN.
 */
function prepareDistanceMatrix(count: number): DistancePoint[][] {
  return Array.from(new Array(count), () =>
    Array.from(Array(count), (a, i) => ({
      index: i,
      distance: Number.NaN
    }))
  )
}

/**
 * Generate a distance matrix.
 *
 * @param data An array of points.
 * @param getPoint The point getter
 * @param rectangle A rectangle defining the extent of the points.
 * @param calcDistance A function to calculate the distance between two points.
 * @returns An array in the same order as the provided points containing an array of point indices and distances, sorted by distance.
 */
export function generateDistanceMatrix<T>(
  data: T[],
  getPoint: (data: T) => Point,
  rectangle: Rectangle,
  calcDistance: (a: Point, b: Point) => number
): DistancePoint[][] {
  const rectangleCenter = calcRectangleCenter(rectangle)
  const m = prepareDistanceMatrix(data.length)

  // Calculate the distance between all the points.
  for (let i = 0; i < data.length; ++i) {
    const centerOffset = calcCenterOffset(getPoint(data[i]), rectangleCenter)

    for (let j = i + 1; j < data.length; ++j) {
      const point = adjustPoint(
        getPoint(data[j]),
        centerOffset,
        rectangle.width
      )
      // The distance from a to be is the same as the distance
      // from b to a, so fill in both entries.
      m[i][j].distance = m[j][i].distance = calcDistance(rectangleCenter, point)
    }

    // The distance from a to a is 0.
    m[i][i].distance = 0
  }

  // Sort in-place the distance array for each point by distance.
  m.forEach(l => l.sort((a, b) => a.distance - b.distance))

  return m
}
