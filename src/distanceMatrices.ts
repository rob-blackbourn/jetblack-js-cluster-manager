import { Point, Rectangle, Size } from './types'

export interface DistancePoint {
  index: number
  distance: number
}

export function calcManhattanDistance(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

export function calcEuclideanDistance(a: Point, b: Point): number {
  const x = a.x - b.x
  const y = a.y - b.y
  return Math.sqrt(x * x + y * y)
}

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

  // Calculate the distance between points.
  for (let i = 0; i < data.length; ++i) {
    const di = data[i]
    const pi = getPoint(di)
    const centerOffset = {
      x: boundsCenter.x - pi.x,
      y: boundsCenter.y - pi.y
    }

    for (let j = i + 1; j < data.length; ++j) {
      const dj = data[j]
      const pj = getPoint(dj)
      const pj1 = adjustPoint(pj, centerOffset, rectangle)
      const distance = calcDistance(boundsCenter, pj1)
      m[i][j].distance = distance
      m[j][i].distance = distance
    }

    m[i][i].distance = 0
  }

  // Sort the distance array for each point by distance.
  for (let i = 0; i < data.length; ++i) {
    m[i] = m[i].sort((a, b) => a.distance - b.distance)
  }

  return m
}
