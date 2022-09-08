import { Feature, Point as GeoJsonPoint } from 'geojson'
import { calcManhattanDistance, calcEuclideanDistance } from '../src'
import { ClusterGenerator } from '../src/ClusterGenerator'
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
     *   0a                  h
     *   1
     *   2  b             g
     *   3
     *   4
     *   5
     *   6      c   d  f
     *   7
     *   8          e
     *   9
     */
    const data: { name: string; point: Point }[] = [
      { name: 'a', point: { x: 0, y: 0 } },
      { name: 'b', point: { x: 2, y: 2 } },
      { name: 'c', point: { x: 6, y: 6 } },
      { name: 'd', point: { x: 10, y: 6 } },
      { name: 'e', point: { x: 10, y: 8 } },
      { name: 'f', point: { x: 13, y: 6 } },
      { name: 'g', point: { x: 16, y: 2 } },
      { name: 'h', point: { x: 19, y: 0 } }
    ]
    const rectangle: Rectangle = {
      x: 0,
      y: 0,
      width: 20,
      height: 10
    }
    const generator = new ClusterGenerator(
      data,
      p => p.point,
      rectangle,
      calcManhattanDistance
    )

    const closestA = generator.within(0, 2 + 2)
    expect(closestA.length).toBe(2)
    const closestB = generator.within(1, 2 + 2)
    expect(closestB.length).toBe(1)
    const closestC = generator.within(2, 2 + 2)
    expect(closestC.length).toBe(1)
    const closestD = generator.within(3, 2 + 2)
    expect(closestD.length).toBe(3)
    const closestE = generator.within(4, 2 + 2)
    expect(closestE.length).toBe(1)
    const closestF = generator.within(5, 2 + 2)
    expect(closestF.length).toBe(1)
    const closestG = generator.within(6, 2 + 2)
    expect(closestG.length).toBe(0)
    const closestH = generator.within(6, 2 + 2)
    expect(closestH.length).toBe(0)
  })
})
