import Graph from "../../src/graph.js";
import Node from "../../src/node.ts";
import Edge from "../../src/edge.js";

const node1 = () => new Node({ id: 1, props: { age: 10 } });
const node2 = () => new Node({ id: 2, props: { color: "red", age: "5" } });
const node3 = () => new Node({ id: 3, props: { color: "green", age: 5.5 } });
const node4 = () => new Node({ id: 4, props: { color: "blue", age: "0" } });
const node5 = () => new Node({ id: 5 });
const node6 = () => new Node({ id: 6 });
const edge1to2 = () => new Edge({ id: 10, from: node1(), to: node2() });
const edge1to3 = () => new Edge({ id: 20, from: node1(), to: node3() });
const edge1to4 = () => new Edge({ id: 30, from: node1(), to: node4() });
const edge2to5 = () => new Edge({ id: 40, from: node2(), to: node5() });
const edge3to5 = () => new Edge({ id: 50, from: node3(), to: node5() });
const edge3to6 = () => new Edge({ id: 60, from: node3(), to: node6() });

const fanOutEdges = new Graph((g) => {
  g.setEdge(edge1to2());
  g.setEdge(edge1to3());
  g.setEdge(edge1to4());
  g.setEdge(edge2to5());
  g.setEdge(edge3to5());
  g.setEdge(edge3to6());
});

const labeled_edge1to2 = () => new Edge({ id: 10, label: "label1", from: node1(), to: node2() });
const labeled_edge1to3 = () => new Edge({ id: 20, label: "label2", from: node1(), to: node3() });
const labeled_edge1to4 = () => new Edge({ id: 30, label: "label3", from: node1(), to: node4() });
const labeled_edge2to5 = () => new Edge({ id: 40, label: "label4", from: node2(), to: node5() });
const labeled_edge3to5 = () => new Edge({ id: 50, label: "label5", from: node3(), to: node5() });
const labeled_edge3to6 = () => new Edge({ id: 60, label: "label6", from: node3(), to: node6() });
const labeled_edge1to5 = () => new Edge({ id: 70, label: "label1", from: node1(), to: node5() });
const labeled_edge1to6 = () => new Edge({ id: 80, label: "label2", from: node1(), to: node6() });

const labeledFanOutEdges = new Graph((g) => {
  g.setEdge(labeled_edge1to2());
  g.setEdge(labeled_edge1to3());
  g.setEdge(labeled_edge1to4());
  g.setEdge(labeled_edge2to5());
  g.setEdge(labeled_edge3to5());
  g.setEdge(labeled_edge3to6());
  g.setEdge(labeled_edge1to5());
  g.setEdge(labeled_edge1to6());
});

export { fanOutEdges, labeledFanOutEdges };
