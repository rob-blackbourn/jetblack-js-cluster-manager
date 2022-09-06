import { Point, PointBounds } from './types'

interface DistancePoint {
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

export function generateDistanceMatrix<T>(
  data: T[],
  getPoint: (data: T) => Point,
  bounds: PointBounds,
  calcDistance: (a: Point, b: Point) => number
): DistancePoint[][] {
  const boundsCenter = {
    x: bounds.topLeft.x + (bounds.bottomRight.x - bounds.topLeft.x) / 2,
    y: bounds.bottomRight.y + (bounds.topLeft.y - bounds.bottomRight.y) / 2
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
      const pj1 = {
        x: pj.x + centerOffset.x,
        y: pj.y + centerOffset.y
      }
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

export class ClusterGenerator<T> {
  distanceMatrix: DistancePoint[][] = []
  points: T[]

  constructor(
    points: T[],
    getPoint: (points: T) => Point,
    bounds: PointBounds,
    calcDistance: (a: Point, b: Point) => number
  ) {
    this.points = points
    this.distanceMatrix = generateDistanceMatrix(
      points,
      getPoint,
      bounds,
      calcDistance
    )
  }

  within(index: number, distance: number): number[] {
    return this.distanceMatrix[index]
      .slice(1)
      .filter(v => v.distance <= distance)
      .map(v => v.index)
  }
}
