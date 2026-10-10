import Graph from "./src/graph";

const graph1 = new Graph();

console.log("helloooo");

console.log("graph 1", typeof graph1.addNode);

const graph2 = new Graph(undefined, { isMutable: true });

console.log("graph 2: ", typeof graph1.addNode);

// graph3 wasnt passed isMutable so graph3.addNode should be undefined?
const graph3 = new Graph();
console.log("graph 3", typeof graph3.addNode);
