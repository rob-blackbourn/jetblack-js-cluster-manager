import { Node } from './Node'
import { pointToCoordinate } from './tileMath'
import { Coordinate } from './types'

export const sum = (a: number[]) => a.reduce((total, value) => total + value, 0)

export function pop<V>(set: Set<V>): V {
  const [value] = set.entries().next().value as [V, V]
  set.delete(value)
  return value
}

export function nodesForRadius<T>(
  parentNodes: Node<T>[],
  tree: KDBush<Node<T>>,
  radius: number,
  minPoints: number,
  dataFactory: (coordinate: Coordinate, nodes: Node<T>[]) => T
): Node<T>[] {
  const clusters: Node<T>[] = []
  const candidates = new Set(parentNodes)

  // As nodes are used they are removed from the set.
  while (candidates.size) {
    const node = pop(candidates)

    // find all nearby points that are still available.
    const neighbors = tree
      .within(node.point.x, node.point.y, radius)
      .map(id => tree.points[id])
      .filter(neighbor => candidates.has(neighbor))
    let numPoints = sum(neighbors.map(n => n.count())) + node.count()

    // Are there neighbors to merge  and enough points to form a cluster?
    if (numPoints > node.count() && numPoints >= minPoints) {
      let wx = node.point.x * node.count()
      let wy = node.point.y * node.count()

      for (const neighbor of neighbors) {
        // When a node is used it is removed from the set of available nodes.
        candidates.delete(neighbor)

        wx += neighbor.point.x * neighbor.count() // accumulate coordinates for calculating weighted center
        wy += neighbor.point.y * neighbor.count()
      }

      // Make a cluster node.
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
      // This node is not part of a cluster.
      clusters.push(node)

      if (numPoints > 1) {
        // If the point was rejected because of the maximum cluster
        // size, treat the neighbors as not pat of a cluster too.
        for (const neighbor of neighbors) {
          candidates.delete(neighbor)
          clusters.push(neighbor)
        }
      }
    }
  }

  return clusters
}
