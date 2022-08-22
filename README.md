# @jetblack/cluster-manager

A geospatial cluster manager.

## Installation

The package can be installed from npmjs.

```bash
npm install --save @jetblack/cluster-manager
```

## Usage

```js
import { ClusterManager } from '@jetblack/cluster-manager'

// The data.
const features = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Greenwich Observatory"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-0.000526, 51.476847]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "name": "Buckingham Palace"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-0.141826, 51.501200]
      }
    },
  ]
}

// Rather than requiring a specific format for the data, a function to
// return the coordinates from a data item is provided.
const getCoordinates = (point) => ({
  latitude: point.geometry.coordinates[1],
  longitude: point.geometry.coordinates[0],
});

// This function is used to make the data item when a cluster point
// is generated.
const makePoint = (coordinate, nodes) => ({
  type: "Feature",
  geometry: {
    type: "Point",
    coordinates: [coordinate.longitude, coordinate.latitude],
  },
  properties: {
    type: "cluster",
    name: ",".join(nodes.flatMap(n => n.leaves()).map(n => n.data.properties.name))
    count: sum(nodes.map((node) => node.count())),
  },
});

// Create the cluster manager
const clusterManager = new ClusterManager(
  pointFeatures.filter(p => p.geometry != null),
  getCoordinates,
  makePoint
)

// Get the cluster for a zoom level and area.
const bounds = {
  northWest: { latitude: 90, longitude: -180 },
  southEast: { latitude: -90, longitude: 180 }
}
const zoom = 2
const cluster2 = clusterManager.getCluster(bounds, zoom)

// The cluster is an array of nodes. The "data" property holds the original
// data for the leaves, and the generated data for the cluster nodes. The
// "nodes" property has an array of the contained nodes. The "leaf" method
// returns the leaf nodes.
for (const node of cluster2) {
  console.log(node.data.properties.name)
  for (leaf of node.leaves()) {
    console.log(leaf.data.properties.name)
  }
}
```

# Acknowledgements

* [supercluster](https://github.com/mapbox/supercluster)
* [kdbush](https://github.com/mourner/kdbush)
