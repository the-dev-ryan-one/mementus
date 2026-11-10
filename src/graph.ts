import GraphBuilder from "./graph-builder.ts";
import Traversal from "./pipeline/traversal.js";
import Mutators from "./mutators.js";
import IntegerId from "./integer-id.ts";
import IncidenceList from "./structure/incidence-list.ts";
import Edge, { type ValidEdge, type propKVpairs } from "./edge.ts";
import ConnectedNode from "./connected-node.ts";
import Node from "./node.ts";
import { type mutatorMixinType } from "./mutators.ts";

interface GraphOptions {
  isMutable?: boolean;
  isDirected?: boolean;
}

const defaultOptions: GraphOptions = {
  isMutable: false,
  isDirected: true,
};

interface Graph extends mutatorMixinType {}

class Graph {
  structure: IncidenceList;
  index: Map<any, any>;
  nodeIds?: IntegerId;
  edgeIds?: IntegerId;

  constructor(initializer?: false | ((builder: GraphBuilder) => void), options: object = {}) {
    const initialOptions = Object.assign(defaultOptions, options);
    const builder = new GraphBuilder();

    if (initializer) {
      initializer(builder);
    }

    this.structure = builder.graph();
    this.index = new Map();

    ///////////////////////////////////////////////////////////////////////////
    //
    // TODO : after this : Object.assign(Graph.prototype, Mutators);
    //        all subsequent Graph instances have the mutator methods
    //        regardless of isMutable ??
    //        is this right ???? (see experiment2.js)
    //
    ///////////////////////////////////////////////////////////////////////////
    if (initialOptions.isMutable) {
      // uses Mutators as a mixin applied to the Graph class conditionaly
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

  /**
   * Starts a traversal at a set of nodes. This is the entry point of a query;
   * steps like `out()` are chained onto the result.
   *
   * @param match - Selects the starting nodes:
   *   - omitted or `null`: every node
   *   - a number: the node with that id
   *   - a string: every node with that label
   *   - an object: every node whose props match all the given key/value pairs
   *
   * @example
   * graph.n().all();               // every node
   * graph.n(1).all();              // the node with id 1
   * graph.n("twig").all();         // nodes labelled "twig"
   * graph.n({ num: "one" }).all(); // nodes with props.num === "one"
   */
  n(match: null | number | string | propKVpairs = null): Traversal {
    const sequence = typeof match === "number" ? [this.structure.node(match)] : this.structure.nodes(match);

    return new Traversal(sequence, this);
  }

  /**
   * Starts a traversal at a set of edges. This is the entry point of a query;
   * steps like `outE()` are chained onto the result.
   *
   * @param match - Selects the starting edges:
   *   - omitted or `null`: every edge
   *   - a number: the edge with that id
   *
   * @example
   * graph.e().all();   // every edge
   * graph.e(10).all(); // the edge with id 10
   */
  e(match: null | number = null): Traversal {
    const sequence = typeof match === "number" ? [this.structure.edge(match)] : this.structure.edges(match);

    return new Traversal(sequence, this);
  }
}

export default Graph;
