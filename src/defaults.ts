import { CoordinateBounds, Point } from './types'
import { calcEuclideanDistance } from './distanceCalculator'

/** Options for the cluster manager */
export interface Options {
  /** The minimum zoom level to generate clusters on. Defaults to 0. */
  minZoom: number
  /** The maximum zoom level to generate clusters on. Defaults to 16. */
  maxZoom: number
  /** The minimum number of points required to form a cluster. Defaults to 2. */
  minPoints: number
  /** The cluster radius in pixels. Defaults to 40. */
  radius: number
  /** The size of the tiles (the radius is calculated relative to it). Defaults to 512. */
  tileSize: number
  /** The function to calculate the distance between two points */
  calcDistance: (a: Point, b: Point) => number
  /** The coordinate bounds */
  bounds: CoordinateBounds
}

/** The extreme north-west and south-east coordinates of the world. */
export const WORLD_BOUNDS = {
  northWest: {
    latitude: 90,
    longitude: -180
  },
  southEast: {
    latitude: -90,
    longitude: 180
  }
}

/** Default options */
export const defaultOptions: Options = {
  minZoom: 0,
  maxZoom: 16,
  minPoints: 2,
  radius: 40,
  tileSize: 512,
  calcDistance: calcEuclideanDistance,
  bounds: WORLD_BOUNDS
}
