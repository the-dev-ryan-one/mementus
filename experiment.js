import test from "ava";
import Graph from "../src/graph.js";
import Node from "../src/node.ts";
import Edge from "../src/edge.js";

const node1 = () => new Node({ id: 1, label: "trunk", props: { num: "one" } });
const node2 = () => new Node({ id: 2, label: "twig", props: { num: "two" } });
const node3 = () => new Node({ id: 3, label: "twig", props: { num: "three" } });
const edge1to2 = () => new Edge({ id: 1, from: node1(), to: node2() });
const edge1to3 = () => new Edge({ id: 2, from: node1(), to: node3() });

const graph = new Graph((g) => {
  node = g.addNode();
});
