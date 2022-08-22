/** Options for the cluster manager */
export interface Options {
  /** The minimum zoom level to generate clusters on */
  minZoom: number
  /** The maximum zoom level to generate clusters on */
  maxZoom: number
  /** The minimum number of points required to form a cluster */
  minPoints: number
  /** The cluster radius in pixels */
  radius: number
  /** The size of the tiles (the radius is calculated relative to it) */
  tileSize: number
  /** size of the KD-tree leaf node, affects performance */
  nodeSize: number
}

/** Default options */
export const defaultOptions: Options = {
  minZoom: 0,
  maxZoom: 16,
  minPoints: 2,
  radius: 40,
  tileSize: 512,
  nodeSize: 64
}
