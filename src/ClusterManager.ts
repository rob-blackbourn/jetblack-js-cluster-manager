import { ClusterGenerator } from './ClusterGenerator'
import { defaultOptions, Options } from './defaults'
import { coordinateToPoint, coordinateToPointBounds } from './tileMath'
import { nodesForRadius } from './utils'
import { Node } from './Node'
import { Coordinate, CoordinateBounds, Point } from './types'

/**
 * The cluster manager.
 *
 * @typeParam T The type of a point
 */
export class ClusterManager<T> {
  private clusters: Array<ClusterGenerator<Node<T>>>
  private minZoom: number
  private maxZoom: number

  /**
   * Create a cluster manager.
   *
   * @typeParam T The type of a point
   *
   * @param points An array of points.
   * @param getCoordinate A function to return the coordinate of a point.
   * @param pointFactory A function to return the point for a cluster node.
   * @param options Options to control the cluster generation.
   */
  constructor(
    points: T[],
    getCoordinate: (data: T) => Coordinate,
    pointFactory: (coordinate: Coordinate, nodes: Node<T>[]) => T,
    options: Partial<Options> = {}
  ) {
    // Merge the options with the  default options.
    const {
      minZoom,
      maxZoom,
      minPoints,
      radius,
      tileSize,
      calcDistance,
      bounds: { northWest, southEast }
    } = {
      ...defaultOptions,
      ...options
    }

    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.clusters = new Array(maxZoom + 1)

    const topLeft = coordinateToPoint(northWest)
    const bottomRight = coordinateToPoint(southEast)
    const rectangle = {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }

    // Generate a node for each point.
    let nodes: Node<T>[] = points.map(datum => {
      const coordinate = getCoordinate(datum)
      return new Node(
        coordinateToPoint(coordinate),
        coordinate,
        [],
        null,
        datum
      )
    })

    // Create an initial cluster from all the points.
    this.clusters[maxZoom + 1] = new ClusterGenerator(
      nodes,
      p => p.point,
      rectangle,
      calcDistance
    )

    // Zoom in a step at a time calculating a new cluster from the previous.
    for (let zoom = maxZoom; zoom >= minZoom; --zoom) {
      // Rather than recalculating the points we increase the radius of
      // the cluster area.
      const zoomRadius = radius / (tileSize * Math.pow(2, zoom))
      nodes = nodesForRadius(
        this.clusters[zoom + 1],
        zoomRadius,
        minPoints,
        pointFactory
      )
      // Make the cluster for this zoom level.
      this.clusters[zoom] = new ClusterGenerator(
        nodes,
        p => p.point,
        rectangle,
        calcDistance
      )
    }
  }

  /**
   * Gets the cluster data for a particular area and zoom level.
   *
   * @typeParam T The type of a point.
   *
   * @param bounds The area for which to return nodes.
   * @param zoom The zoom level.
   * @returns An array of nodes.
   */
  getCluster(bounds: CoordinateBounds, zoom: number): Node<T>[] {
    // Get the cluster for the zoom level.
    const z = Math.max(
      this.minZoom,
      Math.min(Math.floor(zoom), this.maxZoom + 1)
    )
    const cluster = this.clusters[z]

    // Get the point bounds from the coordinate bounds.
    const pointBounds = coordinateToPointBounds(bounds)

    // Get the nodes.
    return cluster.range(pointBounds)
  }
}
