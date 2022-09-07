import { DistancePoint, generateDistanceMatrix } from './distanceMatrices'
import { Point, Rectangle } from './types'

export class ClusterGenerator<T> {
  distanceMatrix: DistancePoint[][] = []
  points: T[]
  getPoint: (points: T) => Point

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

  within(index: number, distance: number): T[] {
    return this.distanceMatrix[index]
      .slice(1)
      .filter(v => v.distance <= distance)
      .map(v => this.points[v.index])
  }

  range(minX: number, minY: number, maxX: number, maxY: number): T[] {
    return this.points.filter(p => {
      const point = this.getPoint(p)
      return (
        point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY
      )
    })
  }
}
