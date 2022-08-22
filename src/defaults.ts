export interface Options {
  /** min zoom to generate clusters on */
  minZoom: number
  /** max zoom level to cluster the points on */
  maxZoom: number
  /** minimum points to form a cluster */
  minPoints: number
  /** cluster radius in pixels */
  radius: number
  /** tile extent (radius is calculated relative to it) */
  extent: number
  /** size of the KD-tree leaf node, affects performance */
  nodeSize: number
}

/** Default options */
export const defaultOptions: Options = {
  minZoom: 0,
  maxZoom: 16,
  minPoints: 2,
  radius: 40,
  extent: 512,
  nodeSize: 64
}
