import Graph from "./src/graph.ts";
import Node from "./src/node.ts";
import Edge from "./src/edge.ts";
import Traversal from "./src/pipeline/traversal.ts";

import graphToHtml from "./src/graph-to-html.ts";

const socialNetworkGraph = new Graph((g) => {
  g.addNode({ id: 1, props: { gender: "male" } });
  g.addNode({ id: 2, props: { gender: "female" } });
  g.addNode({ id: 3, props: { gender: "male" } });

  g.addEdge({ id: 10, from: 1, to: 2, props: { relationship: "friend" } });
  g.addEdge({ id: 20, from: 1, to: 2, props: { relationship: "coworker" } });
  g.addEdge({ id: 30, from: 2, to: 3, props: { relationship: "friend" } });
  g.addEdge({ id: 40, from: 2, to: 3, props: { relationship: "spouse" } });
});

// socialNetworkGraph.n() returns a Traversal
const allGenders = socialNetworkGraph.n().prop("gender").run();
console.log("all genders:", allGenders);

// // filter nodes first, then project gender
// const maleNodes = socialNetworkGraph
//   .n()
//   .filter((n) => n.props.gender === "male")
//   .prop("gender")
//   .all();

// console.log("male genders:", maleNodes);

// // query outgoing neighbours from node 1
// const neighboursOf1 = socialNetworkGraph.n(1).out().all();
// console.log(
//   "neighbours of 1:",
//   neighboursOf1.map((n) => n.id),
// );

// // query only the edge relationships from node 1
// const outgoingRelationships = socialNetworkGraph.n(1).outE().all();
// console.log(
//   "edges from 1:",
//   outgoingRelationships.map((e) => e.props.relationship),
// );

//graphToHtml(socialNetworkGraph);
