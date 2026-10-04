import Node from "./node.ts";
import Edge from "./edge.ts";
import GraphBuilder from "./graph-builder.ts";
import Graph from "./graph.ts";

const Mutators = {
  setNode(this: Graph, node: Node) {
    this.structure.setNode(node);
  },

  setEdge(this: Graph, edge: Edge) {
    this.structure.setEdge(edge);
  },

  addNode(this: Graph, object = {}) {
    if (!object.id) {
      object.id = this.nodeIds.nextId();
    }
    const node = new Node(object);
    this.structure.setNode(node);
    return node;
  },

  addEdge(this: Graph, object = {}) {
    if (!object.id) {
      object.id = this.edgeIds.nextId();
    }

    if (!object.from) {
      object.from = this.addNode();
    }

    if (!object.to) {
      object.to = this.addNode();
    }

    const edge = new Edge(object);
    this.structure.setEdge(edge);
    return edge;
  },

  createNode(this: Graph, builder) {
    const object = { id: null, label: null, props: {} };

    builder(object);

    this.structure.setNode(new Node(object));
  },

  createEdge(this: Graph, builder) {
    const object = { id: null, label: null, props: {}, from: null, to: null };

    builder(object);

    this.structure.setEdge(new Edge(object));
  },
};

export default Mutators;
