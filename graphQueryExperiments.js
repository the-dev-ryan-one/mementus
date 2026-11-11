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
  g.addEdge({ id: 30, from: 2, to: 3, props: { relationship: "friend" }, label: "canopy" });
  g.addEdge({ id: 40, from: 2, to: 3, props: { relationship: "spouse" } });
});

const query = socialNetworkGraph.n(1).out();

// console.log("query: ", query);
// console.log(query[0] === query[1]);

console.log("---------------->", [...query.chain.process()]);

const key = (item) => item;

const isNumeric = (val) => !isNaN(val) && Number.isFinite(+val);
const nums = [];

for (const item of query.chain.process()) {
  const keyed = key(item);
  if (!isNumeric(keyed)) throw new Error("Cannot aggregate not numeric vlaues : check your key function returns a number");
  nums.push(keyed);
}

const toReturn = Math.max(...nums);

//console.log("socialNetworkGraph.n().outE():", socialNetworkGraph.n().outE("canopy"));

// console.log(querry1);

// const generator = socialNetworkGraph.n().outE("canopy").chain.process();

// const collection = [];

// for (const item of generator) {
//   collection.push(item);
// }

// const asSet = new Set(collection);
// const size = asSet.size;

// console.log(size);
