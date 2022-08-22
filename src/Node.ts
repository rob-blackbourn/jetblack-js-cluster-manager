import { Coordinate, Point } from './types'
import { sum } from './utils'

/** A node in the cluster. */
export class Node<T> {
  /** The cartesian point derived fro the coordinate. */
  public point: Point
  /** The world coordinate in latitude and longitude. */
  public coordinate: Coordinate
  /** The nodes contained by this node, if it is a cluster. */
  public nodes: Node<T>[]
  /** The parent node, if this node is a member of a cluster. */
  public parent: Node<T> | null
  /** The data for the point. */
  public data: T

  /**
   * Create a new node.
   *
   * @param point The cartesian point for the coordinate.
   * @param coordinate The coordinate.
   * @param nodes The nodes contained by this node, if any.
   * @param parent The parent of this node, if the node is part of a cluster.
   * @param data The data for the node.
   */
  constructor(
    point: Point,
    coordinate: Coordinate,
    nodes: Node<T>[],
    parent: Node<T> | null,
    data: T
  ) {
    this.point = point
    this.coordinate = coordinate
    this.nodes = nodes
    this.parent = parent
    this.data = data
  }

  /**
   * If the node is not part of a cluster the count will
   * be 1. If the node contains a cluster it will be the
   * sum of the count of all contained nodes.
   *
   * @returns The number of nodes at this point.
   */
  count(): number {
    return this.nodes.length === 0
      ? 1
      : this.nodes.length + sum(this.nodes.map(node => node.count()))
  }

  /**
   * Return all of the leaf nodes from this node.
   *
   * @returns The leaf nodes.
   */
  leaves(): Node<T>[] {
    return this.nodes.length === 0
      ? [this]
      : this.nodes.flatMap(node => node.leaves())
  }
}
