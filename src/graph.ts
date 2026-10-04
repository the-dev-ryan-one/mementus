import GraphBuilder from "./graph-builder.ts";
import Traversal from "./pipeline/traversal.js";
import Mutators from "./mutators.js";
import IntegerId from "./integer-id.ts";
import IncidenceList, { type ValidEdge } from "./structure/incidence-list.ts";
import Edge, { type propKVpairs } from "./edge.ts";
import ConnectedNode from "./connected-node.ts";
import Node from "./node.ts";

interface GraphOptions {
  isMutable?: boolean;
  isDirected?: boolean;
}

const defaultOptions: GraphOptions = {
  isMutable: false,
  isDirected: true,
};

class Graph {
  structure: IncidenceList;
  index: Map<any, any>;
  nodeIds?: IntegerId;
  edgeIds?: IntegerId;

  constructor(
    initializer?: (builder: GraphBuilder) => void,
    options: object = {},
  ) {
    const initialOptions = Object.assign(defaultOptions, options);
    const builder = new GraphBuilder();

    if (initializer) {
      initializer(builder);
    }

    this.structure = builder.graph();
    this.index = new Map();

    if (initialOptions.isMutable) {
      Object.assign(Graph.prototype, Mutators);
      this.nodeIds = new IntegerId(builder.nextNodeId());
      this.edgeIds = new IntegerId(builder.nextEdgeId());
    }
  }

  get nodesCount(): number {
    return this.structure.nodesCount;
  }

  get edgesCount(): number {
    return this.structure.edgesCount;
  }

  node(id: number): ConnectedNode | undefined {
    return this.structure.node(id);
  }

  nodes(match: null | string | propKVpairs = null): ConnectedNode[] {
    return this.structure.nodes(match);
  }

  edge(id: number): ValidEdge | undefined {
    return this.structure.edge(id);
  }

  edges(match: null | string | propKVpairs = null): ValidEdge[] {
    return this.structure.edges(match);
  }

  hasNode(node: number | Node | ConnectedNode): boolean {
    return this.structure.hasNode(node);
  }

  hasEdge(edge: Edge | number): boolean {
    return this.structure.hasEdge(edge);
  }

  outgoing(id: number, label: string | null = null): ConnectedNode[] {
    return this.structure.outgoing(id, label);
  }

  incoming(id: number, label: string | null = null): ConnectedNode[] {
    return this.structure.incoming(id, label);
  }

  outgoingEdges(id: number): ValidEdge[] {
    return this.structure.outgoingEdges(id);
  }

  incomingEdges(id: number): ValidEdge[] {
    return this.structure.incomingEdges(id);
  }

  n(match: null | number = null): Traversal {
    const sequence =
      typeof match === "number"
        ? [this.structure.node(match)]
        : this.structure.nodes(match);

    return new Traversal(sequence, this);
  }

  e(match: null | number = null): Traversal {
    const sequence =
      typeof match === "number"
        ? [this.structure.edge(match)]
        : this.structure.edges(match);

    return new Traversal(sequence, this);
  }
}

export default Graph;
