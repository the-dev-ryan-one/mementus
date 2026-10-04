import Node from "../node.ts";
import Edge from "../edge.ts";
import ConnectedNode from "../connected-node.ts";
import type { propKVpairs } from "../edge.ts";

const DIR_OUT: boolean = true;
const DIR_IN: boolean = false;

export type ValidEdge<T extends propKVpairs = propKVpairs> = Edge<T> & {
  readonly id: number;
  readonly from: Node & { readonly id: number };
  readonly to: Node & { readonly id: number };
};

function isValidEdge(edge: Edge): edge is ValidEdge {
  return (
    Number.isInteger(edge.id) &&
    Number.isInteger(edge.from.id) &&
    Number.isInteger(edge.to.id)
  );
}

class IncidenceList {
  _outgoing: Map<number, number[]>;
  _incoming: Map<number, number[]>;
  outgoingE: Map<number, number[]>;
  incomingE: Map<number, number[]>;
  _nodes: Map<number, ConnectedNode>;
  _edges: Map<number, ValidEdge>;
  isDirected: boolean;

  constructor(isDirected: boolean = true) {
    this._outgoing = new Map();
    this._incoming = new Map();
    this.outgoingE = new Map();
    this.incomingE = new Map();
    this._nodes = new Map();
    this._edges = new Map();
    this.isDirected = isDirected;
  }

  get nodesCount(): number {
    return this._nodes.size;
  }

  get edgesCount(): number {
    return this._edges.size;
  }

  hasNode(node: number | Node | ConnectedNode): boolean {
    if (node instanceof Node || node instanceof ConnectedNode) {
      //-----
      if (node.id === undefined) {
        throw new Error("hasNode: node must have an ID");
      }
      //------
      return this._nodes.get(node.id) === node;
    } else {
      return this._nodes.has(node);
    }
  }

  hasEdge(edge: Edge | number, target: number | null = null): boolean {
    if (target !== null) {
      // -------------
      if (typeof edge !== "number") return false;
      // -------------

      if (!this.node(edge)) return false;
      return this.outgoing(edge).some((n) => n.id === target);
    }

    if (edge instanceof Edge) {
      // -------------
      if (edge.id === undefined) return false;
      // -------------
      return this._edges.get(edge.id) === edge;
    } else {
      return this._edges.has(edge);
    }
  }

  setEdge(edge: Edge) {
    if (!isValidEdge(edge))
      throw new Error("setEdge : edge provided is not a ValidEdge");

    const edgeFromId = edge.from.id;
    const edgeToId = edge.to.id;
    const edgeID = edge.id;

    if (!this.hasNode(edgeFromId)) {
      this.setNode(edge.from);
    }

    if (!this.hasNode(edgeToId)) {
      this.setNode(edge.to);
    }

    this._edges.set(edgeID, edge);
    this._outgoing.get(edgeFromId)!.push(edgeToId);
    this._incoming.get(edgeToId)!.push(edgeFromId);
    this.outgoingE.get(edgeFromId)!.push(edgeID);
    this.incomingE.get(edgeToId)!.push(edgeID);
  }

  setNode(node: Node) {
    if (node.id === undefined) {
      throw new Error("Cannot set node with no id");
    }

    this._nodes.set(node.id, new ConnectedNode(node, this));
    this._outgoing.set(node.id, []);
    this._incoming.set(node.id, []);
    this.outgoingE.set(node.id, []);
    this.incomingE.set(node.id, []);
  }

  node(id: number): ConnectedNode | undefined {
    return this._nodes.get(id);
  }

  edge(id: number): ValidEdge | undefined {
    return this._edges.get(id);
  }

  nodes(match: null | string | propKVpairs): ConnectedNode[] {
    if (!match) return [...this._nodes.values()];

    if (typeof match === "string") {
      return [...this._nodes.values()].filter((node) => node.label === match);
    } else if (typeof match === "object" && match !== null) {
      return [...this._nodes.values()].filter((node) => {
        for (const prop of Object.keys(match)) {
          //-----
          if (node.props === undefined) return false;
          //-----
          if (node.props[prop] !== match[prop]) return false;
        }
        return true;
      });
    }
    throw new Error("Nodes: invalid match provided");
  }

  edges(match: null | string | propKVpairs): ValidEdge[] {
    if (!match) return [...this._edges.values()];

    if (typeof match === "string") {
      return [...this._edges.values()].filter((edge) => edge.label === match);
    } else if (typeof match === "object" && match !== null) {
      return [...this._edges.values()].filter((edge) => {
        for (const prop of Object.keys(match)) {
          if (edge.props[prop] !== match[prop]) return false;
        }
        return true;
      });
    }

    throw new Error("Edges: invalid match provided");
  }

  adjacent(
    id: number,
    direction: boolean = DIR_OUT,
    label: string | null = null,
  ): ConnectedNode[] {
    // console.log("------------------>>>" , id);
    // console.log("------------------>>>" ,direction);
    // console.log("------------------>>>" ,label);

    let directionalIndex;
    if (direction === DIR_OUT) directionalIndex = this._outgoing;
    if (direction === DIR_IN) directionalIndex = this._incoming;

    if (directionalIndex === undefined) {
      throw new Error("direction must be either DIR_OUT or DIR_IN");
    }

    const edgeList = directionalIndex.get(id);

    if (edgeList === undefined) {
      throw new Error(`adjacent: no node with id ${id} in the graph`);
    }

    if (!label) {
      return edgeList.map((adj) => {
        const retrivedNode = this._nodes.get(adj);
        if (retrivedNode === undefined) {
          throw new Error(
            `adjacent: node with id : ${adj} dosn't exist in graph`,
          );
        } else {
          return retrivedNode;
        }
      });
    }

    return this.incidentEdges(id, direction).reduce<ConnectedNode[]>(
      (result, edge) => {
        if (edge.label === label) {
          const node = direction === DIR_OUT ? edge.to : edge.from;
          const connectedNode = this._nodes.get(node.id);
          if (connectedNode === undefined) {
            throw new Error(
              `adjacent: node with id ${node.id} does not exist in graph`,
            );
          } else {
            result.push(connectedNode);
          }
        }
        return result;
      },
      [],
    );
  }

  outgoing(id: number, label: string | null = null): ConnectedNode[] {
    return this.adjacent(id, DIR_OUT, label);
  }

  incoming(id: number, label: string | null = null): ConnectedNode[] {
    return this.adjacent(id, DIR_IN, label);
  }

  incidentEdges(id: number, direction: boolean = DIR_OUT): ValidEdge[] {
    let directionalIndex;
    if (direction === DIR_OUT) directionalIndex = this.outgoingE;
    if (direction === DIR_IN) directionalIndex = this.incomingE;
    if (directionalIndex === undefined) {
      throw new Error("direction must be either DIR_OUT or DIR_IN");
    }

    const edgeList = directionalIndex.get(id);

    if (edgeList === undefined) {
      throw new Error(`incidentEdges: no node with id ${id} in the graph`);
    }

    return edgeList.map((adj) => {
      const edge = this._edges.get(adj);
      if (edge === undefined) {
        throw new Error(
          `incidentEdges: edge ${adj} is listed for node ${id} but missing from the graph`,
        );
      }
      return edge;
    });
  }

  outgoingEdges(id: number): ValidEdge[] {
    return this.incidentEdges(id, DIR_OUT);
  }

  incomingEdges(id: number): ValidEdge[] {
    return this.incidentEdges(id, DIR_IN);
  }

  removeNode(node: Node | number) {
    const nodeId = node instanceof Node ? node.id : node;
    if (nodeId === undefined)
      throw new Error("removeNode: input node has no id");

    const outgoingEdgeIds = this.outgoingE.get(nodeId);
    if (outgoingEdgeIds === undefined)
      throw new Error(`removeNode: node ${nodeId} not found`);

    for (const edgeId of outgoingEdgeIds) {
      const edge = this._edges.get(edgeId);
      if (edge === undefined)
        throw new Error(`removeNode: edge ${edgeId} missing from _edges`);

      const toId = edge.to.id;
      const incomingEdge = this.incomingE.get(toId);
      const incomingNode = this._incoming.get(toId);
      if (incomingNode === undefined || incomingEdge === undefined)
        throw new Error(
          `removeNode: node ${toId} missing from _incoming or incomingE`,
        );

      const incomingNodeIndex = incomingNode.indexOf(nodeId);
      if (incomingNodeIndex === -1)
        throw new Error(
          `removeNode: node ${nodeId} missing from incoming list of ${toId}`,
        );
      incomingNode.splice(incomingNodeIndex, 1);

      const incomingEdgeIndex = incomingEdge.indexOf(edgeId);
      if (incomingEdgeIndex === -1)
        throw new Error(
          `removeNode: edge ${edgeId} missing from incoming edges of ${toId}`,
        );
      incomingEdge.splice(incomingEdgeIndex, 1);
      this._edges.delete(edgeId);
    }

    const incomingEdges = this.incomingE.get(nodeId);
    if (incomingEdges === undefined)
      throw new Error(`removeNode: node ${nodeId} missing from incomingE`);

    for (const edgeId of incomingEdges) {
      const edges = this._edges.get(edgeId);
      if (edges === undefined)
        throw new Error(`removeNode: edge ${edgeId} missing from _edges`);

      const fromId = edges.from.id;
      const outgoingNode = this._outgoing.get(fromId);
      const outgoingEdge = this.outgoingE.get(fromId);
      if (outgoingNode === undefined || outgoingEdge === undefined)
        throw new Error(
          `removeNode: node ${fromId} missing from _outgoing or outgoingE`,
        );

      const outgoingNodeIndex = outgoingNode.indexOf(nodeId);
      if (outgoingNodeIndex === -1)
        throw new Error(
          `removeNode: node ${nodeId} missing from outgoing list of ${fromId}`,
        );
      outgoingNode.splice(outgoingNodeIndex, 1);

      const outgoingEdgeIndex = outgoingEdge.indexOf(edgeId);
      if (outgoingEdgeIndex === -1)
        throw new Error(
          `removeNode: edge ${edgeId} missing from outgoing edges of ${fromId}`,
        );
      outgoingEdge.splice(outgoingEdgeIndex, 1);
      this._edges.delete(edgeId);
    }

    this._nodes.delete(nodeId);
  }

  removeEdge(edge: number | Edge) {
    const edgeId = edge instanceof Edge ? edge.id : edge;
    if (edgeId === undefined) return;

    const retrivedEdge = this._edges.get(edgeId);
    if (retrivedEdge === undefined) {
      throw new TypeError(`Cannot remove edge ${edgeId}: edge not found`);
    }

    const { to, from } = retrivedEdge;

    // console.log("================================================")
    // console.log("PRINT IncidenceList ")
    // console.log("this._outgoing " , this._outgoing )
    // console.log("this._incoming " , this._incoming )
    // console.log("this.outgoingE " , this.outgoingE )
    // console.log("this.incomingE " , this.incomingE )
    // console.log("this._nodes " , this._nodes )
    // console.log("this._edges " , this._edges )
    // console.log("================================================")

    const fromId = from.id;
    const toId = to.id;

    const outgoingNeighborIds = this._outgoing.get(fromId);
    const incomingNeighborIds = this._incoming.get(toId);
    const outgoingEdgeIds = this.outgoingE.get(fromId);
    const incomingEdgeIds = this.incomingE.get(toId);

    // if the to and from node / edge ID's are not in the appropriate lists , no op
    if (
      !outgoingNeighborIds ||
      !incomingNeighborIds ||
      !outgoingEdgeIds ||
      !incomingEdgeIds
    ) {
      throw new Error(
        `removeEdge: to node: ${toId} and/or from node: ${fromId} missing from _outgoing, _incoming, outgoingE or incomingE`,
      );
    }

    const toIndex = outgoingNeighborIds.indexOf(toId);
    if (toIndex === -1)
      throw new Error(
        `removeEdge: node ${toId} missing from outgoing list of ${fromId}`,
      );
    outgoingNeighborIds.splice(toIndex, 1);

    const fromIndex = incomingNeighborIds.indexOf(fromId);
    if (fromIndex === -1)
      throw new Error(
        `removeEdge: node ${fromId} missing from incoming list of ${toId}`,
      );
    incomingNeighborIds.splice(fromIndex, 1);

    const outgoingEdgeIndex = outgoingEdgeIds.indexOf(edgeId);
    if (outgoingEdgeIndex === -1)
      throw new Error(
        `removeEdge: edge ${edgeId} missing from outgoing edges of ${fromId}`,
      );
    outgoingEdgeIds.splice(outgoingEdgeIndex, 1);

    const incomingEdgeIndex = incomingEdgeIds.indexOf(edgeId);
    if (incomingEdgeIndex === -1)
      throw new Error(
        `removeEdge: edge ${edgeId} missing from incoming edges of ${toId}`,
      );
    incomingEdgeIds.splice(incomingEdgeIndex, 1);

    this._edges.delete(edgeId);
  }
}

export default IncidenceList;
