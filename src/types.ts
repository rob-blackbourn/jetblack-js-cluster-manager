export interface Coordinate {
  latitude: number
  longitude: number
}

export interface Point {
  x: number
  y: number
}

export interface CoordinateBounds {
  northWest: Coordinate
  southEast: Coordinate
}

export interface PointBounds {
  topLeft: Point
  bottomRight: Point
}
