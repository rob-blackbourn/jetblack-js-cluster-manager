import { Feature, Point } from 'geojson'
import { ClusterManager, Coordinate, Node } from '../src'
import { sum } from '../src/utils'

import places from './fixtures/places.json'

const getCoordinates = (point: Feature<Point>) => ({
  latitude: point.geometry.coordinates[1],
  longitude: point.geometry.coordinates[0]
})

const makePoint = (
  coordinate: Coordinate,
  nodes: Node<Feature<Point>>[]
): Feature<Point> => ({
  type: 'Feature',
  geometry: {
    type: 'Point',
    coordinates: [coordinate.longitude, coordinate.latitude]
  },
  properties: {
    type: 'cluster',
    count: sum(nodes.map(node => node.count()))
  }
})

describe('nodes', () => {
  it('gets nodes for zoom levels', () => {
    const pointFeatures = places.features as Feature<Point>[]
    const zoomCount = [
      [0, 32],
      [1, 61],
      [2, 100],
      [3, 137],
      [4, 149],
      [5, 159],
      [6, 162],
      [7, 162],
      [8, 162],
      [9, 162],
      [10, 162],
      [11, 162],
      [12, 162],
      [13, 162],
      [14, 162],
      [15, 162],
      [16, 162]
    ]
    const clusters = new ClusterManager<Feature<Point>>(
      pointFeatures.filter(p => p.geometry != null),
      getCoordinates,
      makePoint
    )
    zoomCount.forEach(([zoom, count]) => {
      const cluster = clusters.getCluster(
        {
          northWest: { longitude: -180, latitude: 90 },
          southEast: { longitude: 180, latitude: -90 }
        },
        zoom
      )
      expect(cluster.length).toBe(count)
    })
  })
})

describe('leaves', () => {
  it('should get leaves', () => {
    const pointFeatures = (places.features as Feature<Point>[]).filter(
      p => p.geometry != null
    )
    const clusters = new ClusterManager<Feature<Point>>(
      pointFeatures,
      getCoordinates,
      makePoint
    )
    const cluster = clusters.getCluster(
      {
        northWest: { latitude: 90, longitude: -180 },
        southEast: { latitude: -90, longitude: 180 }
      },
      1
    )
    const leaves = cluster[0]
      .leaves()
      .map(node => node.data.properties?.name || 'unknown')
    expect(leaves).toEqual([
      'Niagara Falls',
      'Cape May',
      'Cape Cod',
      'Cape Sable',
      'Cape Hatteras',
      'Cape Fear'
    ])
  })
})
