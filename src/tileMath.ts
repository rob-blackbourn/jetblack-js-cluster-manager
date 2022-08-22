import { Coordinate, CoordinateBounds, Point, PointBounds } from './types'

const fround =
  Math.fround ||
  (tmp => x => {
    tmp[0] = +x
    return tmp[0]
  })(new Float32Array(1))

// longitude/latitude to spherical mercator in [0..1] range
function longitudeToX(lng: number): number {
  return lng / 360 + 0.5
}

function latitudeToY(lat: number): number {
  const sin = Math.sin((lat * Math.PI) / 180)
  const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI
  return y < 0 ? 0 : y > 1 ? 1 : y
}

// spherical mercator to longitude/latitude
function xToLongitude(x: number): number {
  return (x - 0.5) * 360
}

function yToLongitude(y: number): number {
  const y2 = ((180 - y * 360) * Math.PI) / 180
  return (360 * Math.atan(Math.exp(y2))) / Math.PI - 90
}

export const coordinateToPoint = ({
  latitude,
  longitude
}: Coordinate): Point => ({
  x: fround(longitudeToX(longitude)),
  y: fround(latitudeToY(latitude))
})

export const pointToCoordinate = ({ x, y }: Point): Coordinate => ({
  latitude: yToLongitude(y),
  longitude: xToLongitude(x)
})

export const coordinateToPointBounds = (
  bounds: CoordinateBounds
): PointBounds => ({
  topLeft: coordinateToPoint(bounds.northWest),
  bottomRight: coordinateToPoint(bounds.southEast)
})
