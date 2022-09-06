import { Point, PointBounds } from './types'

interface DistancePoint {
  index: number
  distance: number
}

function calcBoundsCenter(bounds: PointBounds): Point {
  return {
    x: bounds.topLeft.x + (bounds.bottomRight.x - bounds.topLeft.x) / 2,
    y: bounds.bottomRight.y + (bounds.topLeft.y - bounds.bottomRight.y) / 2
  }
}

function calcCenterOffset(point: Point, boundsCenter: Point): Point {
  return {
    x: boundsCenter.x - point.x,
    y: boundsCenter.y - point.y
  }
}

export class Neighbors<T> {
  distances: DistancePoint[][] = []

  constructor(data: T[], getPoint: (data: T) => Point, bounds: PointBounds) {
    const boundsCenter = calcBoundsCenter(bounds)

    this.distances = Array.from(new Array(data.length), () =>
      Array.from(Array(data.length), (a, i) => ({
        index: i,
        distance: Number.NaN
      }))
    )

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
        const distance =
          Math.abs(boundsCenter.x - pj1.x) + Math.abs(boundsCenter.y - pj1.y)
        this.distances[i][j].distance = distance
        this.distances[j][i].distance = distance
      }

      this.distances[i][i].distance = 0
    }

    for (let i = 0; i < data.length; ++i) {
      this.distances[i] = this.distances[i].sort(
        (a, b) => a.distance - b.distance
      )
    }
  }

  find(i: number, r: number, zoom: number, tileSize: number): number[] {
    const distance = (r + r) / (tileSize * Math.pow(2, zoom))

    return this.distances[i]
      .slice(1)
      .filter(v => v.distance <= distance)
      .map(v => v.index)
  }
}
