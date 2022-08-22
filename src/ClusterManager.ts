import KDBush from 'kdbush'
import { defaultOptions, Options } from './defaults'
import {
  coordinateToPoint,
  coordinateToPointBounds,
  pointToCoordinate
} from './tileMath'
import { pop, sum } from './utils'
import { Node } from './Node'
import { Coordinate, CoordinateBounds } from './types'

function nodesForRadius<T>(
  parentNodes: Node<T>[],
  tree: KDBush<Node<T>>,
  radius: number,
  minPoints: number,
  dataFactory: (coordinate: Coordinate, nodes: Node<T>[]) => T
): Node<T>[] {
  const clusters: Node<T>[] = []
  // const r = radius / (extent * Math.pow(2, zoom))

  const candidates = new Set(parentNodes)

  while (candidates.size) {
    const node = pop(candidates)

    // find all nearby points that are still available
    const neighbors = tree
      .within(node.point.x, node.point.y, radius)
      .map(id => tree.points[id])
      .filter(neighbor => candidates.has(neighbor))
    let numPoints = sum(neighbors.map(n => n.count())) + node.count()

    // if there were neighbors to merge, and there are enough points to form a cluster
    if (numPoints > node.count() && numPoints >= minPoints) {
      let wx = node.point.x * node.count()
      let wy = node.point.y * node.count()

      for (const neighbor of neighbors) {
        candidates.delete(neighbor)

        wx += neighbor.point.x * neighbor.count() // accumulate coordinates for calculating weighted center
        wy += neighbor.point.y * neighbor.count()
      }

      const point = { x: wx / numPoints, y: wy / numPoints }
      const coordinate = pointToCoordinate(point)
      const cluster = [node, ...neighbors]
      const clusterNode = new Node<T>(
        point,
        coordinate,
        cluster,
        node,
        dataFactory(coordinate, cluster)
      )

      clusters.push(clusterNode)
    } else {
      // left points as unclustered
      clusters.push(node)

      if (numPoints > 1) {
        for (const neighbor of neighbors) {
          candidates.delete(neighbor)
          clusters.push(neighbor)
        }
      }
    }
  }

  return clusters
}

/**
 * The cluster manager.
 */
export class ClusterManager<T> {
  private getCoordinate: (data: T) => Coordinate
  private dataFactory: (coordinate: Coordinate, nodes: Node<T>[]) => T
  private options: Options
  private trees: Array<KDBush<Node<T>>>

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
    this.getCoordinate = getCoordinate
    this.dataFactory = dataFactory
    this.options = { ...defaultOptions, ...options }
    this.trees = new Array(this.options.maxZoom + 1)

    const { minZoom, maxZoom, nodeSize } = this.options

    // generate a cluster object for each point and index input points into a KD-tree
    let nodes: Node<T>[] = data.map(datum => {
      const coordinate = this.getCoordinate(datum)
      return new Node(
        coordinateToPoint(coordinate),
        coordinate,
        [],
        null,
        datum
      )
    })

    this.trees[maxZoom + 1] = new KDBush(
      nodes,
      p => p.point.x,
      p => p.point.y,
      nodeSize,
      Float32Array
    )

    for (let zoom = maxZoom; zoom >= minZoom; --zoom) {
      nodes = nodesForRadius(
        nodes,
        this.trees[zoom + 1],
        this.options.radius / (this.options.tileSize * Math.pow(2, zoom)),
        this.options.minPoints,
        this.dataFactory
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
    const { minZoom, maxZoom } = this.options
    const z = Math.max(minZoom, Math.min(Math.floor(zoom), maxZoom + 1))
    const tree = this.trees[z]
    const {
      topLeft: { x: minX, y: minY },
      bottomRight: { x: maxX, y: maxY }
    } = coordinateToPointBounds(bounds)
    const ids = tree.range(minX, minY, maxX, maxY)
    return ids.map(id => tree.points[id])
  }
}
