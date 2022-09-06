import { Feature, Point } from 'geojson'
import { ClusterManager, Coordinate, Neighbors, Node } from '../src/'
import { coordinateToPoint } from '../src/tileMath'
import { PointBounds } from '../src/types'

import places from './fixtures/places.json'

const getCoordinates = (point: Feature<Point>) => ({
  latitude: point.geometry.coordinates[1],
  longitude: point.geometry.coordinates[0]
})

describe('neighbors', () => {
  it('should do something', () => {
    const data = (places.features as Feature<Point>[])
      .filter((p, i) => p.geometry != null && i < 10)
      .map(p => getCoordinates(p))
      .map(coordinateToPoint)
    const bounds: PointBounds = {
      topLeft: {
        x: Math.min(...data.map(p => p.x)),
        y: Math.min(...data.map(p => p.y))
      },
      bottomRight: {
        x: Math.max(...data.map(p => p.x)),
        y: Math.max(...data.map(p => p.y))
      }
    }
    const neighbors = new Neighbors(data, p => p, bounds)
    const closest = neighbors.find(0, 30, 0, 256)
    expect(closest.length).toBe(2)
  })
})
