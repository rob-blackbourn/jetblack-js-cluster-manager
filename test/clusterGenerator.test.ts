import { Feature, Point as GeoJsonPoint } from 'geojson'
import {
  ClusterGenerator,
  calcManhattanDistance,
  calcEuclideanDistance
} from '../src'
import { coordinateToPoint } from '../src/tileMath'
import { Point, Rectangle } from '../src/types'

import places from './fixtures/places.json'

const getCoordinates = (point: Feature<GeoJsonPoint>) => ({
  latitude: point.geometry.coordinates[1],
  longitude: point.geometry.coordinates[0]
})

describe('neighbors', () => {
  it('should do something', () => {
    const data = (places.features as Feature<GeoJsonPoint>[])
      .filter((p, i) => p.geometry != null) // && i < 10)
      .map(p => getCoordinates(p))
      .map(coordinateToPoint)

    const xMin = Math.min(...data.map(p => p.x))
    const yMin = Math.min(...data.map(p => p.y))
    const xMax = Math.max(...data.map(p => p.x))
    const yMax = Math.max(...data.map(p => p.y))
    const rectangle: Rectangle = {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin
    }
    const generator = new ClusterGenerator(
      data,
      p => p,
      rectangle,
      calcEuclideanDistance
    )

    const tileSize = 256,
      zoom = 0,
      r = 30
    const distance = r / (tileSize * Math.pow(2, zoom))

    const closest = generator.within(0, distance)
    expect(closest.length).toBe(33)
  })

  it('should do something more', () => {
    /*
     *  0         1
     * 0  01234567890123456789
     *   0a
     *   1
     *   2  b
     *   3
     *   4
     *   5
     *   6      c
     *   7
     *   8
     *   9
     *  10          X
     *  11
     *  12
     *  13
     *  14                d
     *  15
     *  16
     *  17
     *  18
     *  19                  e
     */
    const data: { name: string; point: Point }[] = [
      { name: 'a', point: { x: 0, y: 0 } },
      { name: 'b', point: { x: 2, y: 2 } },
      { name: 'c', point: { x: 6, y: 6 } },
      { name: 'd', point: { x: 16, y: 14 } },
      { name: 'e', point: { x: 18, y: 19 } }
    ]
    const rectangle: Rectangle = {
      x: 0,
      y: 0,
      width: 20,
      height: 20
    }
    const generator = new ClusterGenerator(
      data,
      p => p.point,
      rectangle,
      calcManhattanDistance
    )

    const closest = generator.within(0, 2 + 2)
    expect(closest.length).toBe(2)
  })
})
