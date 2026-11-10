import Graph from "./src/graph.ts";
import Node from "./src/node.ts";
import Edge from "./src/edge.ts";
import Traversal from "./src/pipeline/traversal.ts";

const socialNetworkGraph = new Graph((g) => {
  g.addNode({ id: 1, label: "John", props: { gender: "male", job: "SWE", age: 35 } });
  g.addNode({ id: 2, label: "Lucy", props: { gender: "female", job: "Data scientist", age: 30 } });
  g.addNode({ id: 3, label: "Jack", props: { gender: "male", job: "Tech lead", age: 45 } });

  g.addEdge({ id: 10, from: 1, to: 2, props: { relationship: "friend" }, label: "canopy" });
  g.addEdge({ id: 20, from: 1, to: 2, props: { relationship: "coworker" } });
  g.addEdge({ id: 30, from: 2, to: 3, props: { relationship: "friend" } });
  g.addEdge({ id: 40, from: 2, to: 3, props: { relationship: "spouse" } });
});

const querry1 = socialNetworkGraph
  .n()
  .filter((x) => x.id >= 2)
  .all();

console.log(querry1);
