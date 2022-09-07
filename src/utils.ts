import { ClusterGenerator } from './ClusterGenerator'
import { Node } from './Node'
import { pointToCoordinate } from './tileMath'
import { Coordinate } from './types'

export const sum = (a: number[]) => a.reduce((total, value) => total + value, 0)

export function nodesForRadius<T>(
  tree: ClusterGenerator<Node<T>>,
  radius: number,
  minPoints: number,
  nodeFactory: (coordinate: Coordinate, nodes: Node<T>[]) => T
): Node<T>[] {
  const clusters: Node<T>[] = []
  // As nodes are used they are removed from the set.
  const candidates = new Set(tree.points)

  for (let i = 0; i < tree.points.length && candidates.size; ++i) {
    const node = tree.points[i]
    if (!candidates.has(node)) {
      continue
    }
    candidates.delete(node)

    // find all nearby points that are still available.
    const neighbors = tree
      .within(i, radius)
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
        nodeFactory(coordinate, cluster)
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
