import { Coordinate, Point } from './types'
import { sum } from './utils'

export class Node<T> {
  public point: Point
  public coordinate: Coordinate
  public nodes: Node<T>[]
  public parent: Node<T> | null
  public data: T

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

  count(): number {
    return this.nodes.length === 0
      ? 1
      : this.nodes.length + sum(this.nodes.map(node => node.count()))
  }

  leaves(): Node<T>[] {
    return this.nodes.length === 0
      ? [this]
      : this.nodes.flatMap(node => node.leaves())
  }
}
