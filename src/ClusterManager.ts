import KDBush from 'kdbush'
import { defaultOptions, Options } from './defaults'
import { coordinateToPoint, coordinateToPointBounds } from './tileMath'
import { nodesForRadius } from './utils'
import { Node } from './Node'
import { Coordinate, CoordinateBounds } from './types'

/**
 * The cluster manager.
 */
export class ClusterManager<T> {
  private trees: Array<KDBush<Node<T>>>
  private minZoom: number
  private maxZoom: number

  /**
   * Create a cluster manager.
   *
   * @param data The data for a point.
   * @param getCoordinate A function to return the coordinate of a point.
   * @param dataFactory A function to return the data for a cluster point.
   * @param options Options to control the cluster generation.
   */
  constructor(
    data: T[],
    getCoordinate: (data: T) => Coordinate,
    dataFactory: (coordinate: Coordinate, nodes: Node<T>[]) => T,
    options: Partial<Options> = {}
  ) {
    const { minZoom, maxZoom, minPoints, radius, tileSize, nodeSize } = {
      ...defaultOptions,
      ...options
    }

    this.minZoom = minZoom
    this.maxZoom = maxZoom
    this.trees = new Array(maxZoom + 1)

    // Generate a cluster object for each data point and index input points
    // into a KD-tree.
    let nodes: Node<T>[] = data.map(datum => {
      const coordinate = getCoordinate(datum)
      return new Node(
        coordinateToPoint(coordinate),
        coordinate,
        [],
        null,
        datum
      )
    })

    // Initialize the tree with all of the data points.
    this.trees[maxZoom + 1] = new KDBush(
      nodes,
      p => p.point.x,
      p => p.point.y,
      nodeSize,
      Float32Array
    )

    // Zoom in a step at a time calculating a new cluster.
    for (let zoom = maxZoom; zoom >= minZoom; --zoom) {
      // Rather than recalculating the points we increase the radius of
      // the cluster area.
      const zoomRadius = radius / (tileSize * Math.pow(2, zoom))
      nodes = nodesForRadius(
        nodes,
        this.trees[zoom + 1],
        zoomRadius,
        minPoints,
        dataFactory
      )
      this.trees[zoom] = new KDBush(
        nodes,
        p => p.point.x,
        p => p.point.y,
        nodeSize,
        Float32Array
      )
    }
  }

  /**
   * Gets the cluster data for a particular area and zoom level.
   *
   * @param bounds The area for which to return nodes.
   * @param zoom The zoom level.
   * @returns An array of nodes.
   */
  getCluster(bounds: CoordinateBounds, zoom: number): Node<T>[] {
    const z = Math.max(
      this.minZoom,
      Math.min(Math.floor(zoom), this.maxZoom + 1)
    )
    const tree = this.trees[z]
    const {
      topLeft: { x: minX, y: minY },
      bottomRight: { x: maxX, y: maxY }
    } = coordinateToPointBounds(bounds)
    const ids = tree.range(minX, minY, maxX, maxY)
    return ids.map(id => tree.points[id])
  }
}
