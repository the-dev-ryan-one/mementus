import Graph from "./src/graph.ts";
import Node from "./src/node.ts";
import Edge from "./src/edge.ts";
import Traversal from "./src/pipeline/traversal.ts";

const socialNetworkGraph = new Graph((g) => {
  g.addNode({ id: 1, props: { gender: "male" } });
  g.addNode({ id: 2, props: { gender: "female" } });
  g.addNode({ id: 3, props: { gender: "male" } });

  g.addEdge({ id: 10, from: 1, to: 2, props: { relationship: "friend" } });
  g.addEdge({ id: 20, from: 1, to: 2, props: { relationship: "coworker" } });
  g.addEdge({ id: 30, from: 2, to: 3, props: { relationship: "friend" } });
  g.addEdge({ id: 40, from: 2, to: 3, props: { relationship: "spouse" } });
});

const predicate = (x) => x.props["gender"] == "male";

const result = socialNetworkGraph.n().prop("gender").filter(predicate).all();
console.log(result);
