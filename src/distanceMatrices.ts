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
 * the rectangle, adjust it by wrapping around.
 *
 * @param point A point.
 * @param offset An offset, by which to adjust the point.
 * @param param2 The size of the rectangle.
 * @returns The adjusted point.
 */
function adjustPoint(
  point: Point,
  offset: Point,
  { width, height }: Size
): Point {
  const x = point.x + offset.x
  const y = point.y + offset.y
  return {
    x: x < 0 ? x + width : x >= width ? x - width : x,
    y: y < 0 ? y + height : y >= height ? y - height : y
  }
}

function calcCenterOffset(point: Point, boundsCenter: Point): Point {
  return {
    x: boundsCenter.x - point.x,
    y: boundsCenter.y - point.y
  }
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
  const boundsCenter = {
    x: -rectangle.x + rectangle.width / 2,
    y: -rectangle.y + rectangle.height / 2
  }

  // A square matrix to hold the distance between points.
  const m = Array.from(new Array(data.length), () =>
    Array.from(Array(data.length), (a, i) => ({
      index: i,
      distance: Number.NaN
    }))
  )

  // Calculate the distance between all the points.
  for (let i = 0; i < data.length; ++i) {
    const centerOffset = calcCenterOffset(getPoint(data[i]), boundsCenter)

    for (let j = i + 1; j < data.length; ++j) {
      const point = adjustPoint(getPoint(data[j]), centerOffset, rectangle)
      const distance = calcDistance(boundsCenter, point)
      // The distance from a to be is the same as the distance
      // from b to a, so fill in both entries.
      m[i][j].distance = m[j][i].distance = distance
    }

    // The distance from a to a is 0.
    m[i][i].distance = 0
  }

  // Sort the distance array for each point by distance.
  for (let i = 0; i < data.length; ++i) {
    m[i] = m[i].sort((a, b) => a.distance - b.distance)
  }

  return m
}
