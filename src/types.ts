/** The world coordinate */
export interface Coordinate {
  /** The latitude from 90 to -90, north to south. */
  latitude: number
  /** The longitude from 180 to -180, east to west. */
  longitude: number
}

/** A cartesian point */
export interface Point {
  /** The position on the horizontal axis. */
  x: number
  /** The position on the vertical axis. */
  y: number
}

/** The bounds of the world coordinates. */
export interface CoordinateBounds {
  /** The world coordinate at the most north west point. */
  northWest: Coordinate
  /** The world coordinate at the most south east point. */
  southEast: Coordinate
}

/** The bounds of the cartesian coordinates */
export interface PointBounds {
  /** The point at the top left. */
  topLeft: Point
  /** The point at the bottom right. */
  bottomRight: Point
}

export interface Size {
  width: number
  height: number
}

export interface Rectangle extends Point, Size {}
