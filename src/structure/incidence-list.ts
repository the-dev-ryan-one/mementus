import Node from "../node.ts";
import Edge from "../edge.ts";
import ConnectedNode from "../connected-node.ts";
import type { propKVpairs } from "../edge.ts";

const DIR_OUT : boolean = true;
const DIR_IN : boolean = false;

type ValidEdge<T extends propKVpairs = propKVpairs> = Edge<T> & {
  readonly id: number;
  readonly from: Node & { readonly id: number };
  readonly to: Node & { readonly id: number };
}

class IncidenceList {

  _outgoing : Map<number , number[]>;
  _incoming : Map<number , number[]>;
  outgoingE : Map<number , number[]>;
  incomingE : Map<number , number[]>;
  _nodes : Map<number , ConnectedNode>;
  _edges : Map<number , ValidEdge>;
  isDirected : boolean;

  constructor(isDirected : boolean =true) {

    this._outgoing = new Map(); 
    this._incoming = new Map();
    this.outgoingE = new Map();
    this.incomingE = new Map();
    this._nodes = new Map();
    this._edges = new Map();
    this.isDirected = isDirected;

  }

  get nodesCount() : number {
    return this._nodes.size;
  }

  get edgesCount() : number {
    return this._edges.size;
  }

  hasNode(node : number | Node | ConnectedNode) : boolean {

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

  hasEdge(edge : Edge|number, target: number | null = null) : boolean {

    if (target !== null) {
 
      // -------------
      if (typeof edge !== "number") return false;
      // -------------

      if (!this.node(edge)) return false;
      return this.outgoing(edge).some(n => n.id == target);
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

  setEdge(edge : Edge) {
  
    const edgeFromId = edge.from.id;
    const edgeToId = edge.to.id;
    if (edgeFromId === undefined) {
      throw new Error("Cannot set edge : from node is undefined");
    }
    if (edgeToId === undefined) {
      throw new Error("Cannot set edge : to node is undefined");
    }
    const edgeID = edge.id;
    if (edgeID === undefined) {
      throw new Error("Cannot set edge with no ID");
    }

    if (!this.hasNode(edgeFromId)) {
      this.setNode(edge.from);
    }

    if (!this.hasNode(edgeToId)) {
      this.setNode(edge.to);
    }

    // make a new edge type validEdge , because ive validated the edges being pushed into the incidence list

    this._edges.set(edgeID, edge as ValidEdge);
    this._outgoing.get(edgeFromId)!.push(edgeToId);
    this._incoming.get(edgeToId)!.push(edgeFromId);
    this.outgoingE.get(edgeFromId)!.push(edgeID);
    this.incomingE.get(edgeToId)!.push(edgeID);
  }

  setNode(node : Node) {

    if (node.id === undefined) {
      throw new Error("Cannot set node with no id");
    }

    this._nodes.set(node.id, new ConnectedNode(node, this));
    this._outgoing.set(node.id, []);
    this._incoming.set(node.id, []);
    this.outgoingE.set(node.id, []);
    this.incomingE.set(node.id, []);
  }

  node(id : number) : ConnectedNode | undefined {
    return this._nodes.get(id);
  }

  edge(id : number) : Edge | undefined {
    return this._edges.get(id);
  }

  nodes(match : null | string | propKVpairs) : ConnectedNode[] {

    // console.log("@@@@@@@@@@@@@@@@@>>>" , match)
    // console.log([...this._nodes.values()])
    if (!match) return [...this._nodes.values()];

    if (typeof(match) === "string") {
      return [...this._nodes.values()].filter(node => node.label === match);

    } else if (typeof(match) === "object" && match !== null) {
      
      return [...this._nodes.values()].filter(node => {
      
        for (const prop of Object.keys(match)) {

          //-----
          if (node.props === undefined) return false;
          //-----
          if (node.props[prop] !== match[prop]) return false;
        }
        return true;
      });
    }
     throw new Error('Nodes: invalid match provided');
  }

  edges(match : null | string | propKVpairs ) : ValidEdge[] {

    if (!match) return [...this._edges.values()];

    if (typeof(match) === "string") {
      return [...this._edges.values()].filter(edge => edge.label === match);


    } else if (typeof(match) === "object" && match !== null) {

      return [...this._edges.values()].filter(edge => {
        for (const prop of Object.keys(match)) {
          if (edge.props[prop] !== match[prop]) return false;
        }
        return true;
      });

    }

    throw new Error('Edges: invalid match provided');

  }

  adjacent(id:number, direction:boolean=DIR_OUT, label=null) : ConnectedNode[] {

    // console.log("------------------>>>" , id);
    // console.log("------------------>>>" ,direction);
    // console.log("------------------>>>" ,label);

    let directionalIndex;
    if (direction == DIR_OUT) directionalIndex = this._outgoing;
    if (direction == DIR_IN) directionalIndex = this._incoming;

    if (directionalIndex === undefined) {
      throw new Error("direction must be either DIR_OUT or DIR_IN");
    }

    const edgeList = directionalIndex.get(id);
    
    if (edgeList === undefined) {
      throw new Error(`adjacent: no node with id ${id} in the graph`);
    }

    if (!label) {
      return edgeList.map(adj => { 
        
        const retrivedNode = this._nodes.get(adj);
        if (retrivedNode === undefined) {
          throw new Error(`adjacent: node with id : ${adj} dosn't exist in graph`);
        } else {
          return retrivedNode;
        }

      });
    }

    return this.incidentEdges(id, direction).reduce<ConnectedNode[]>((result, edge) => {
      if (edge.label == label) {
        const node = direction == DIR_OUT ? edge.to : edge.from;
        const connectedNode = this._nodes.get(node.id);
        if (connectedNode === undefined) {
          throw new Error(`adjacent: node with id ${node.id} does not exist in graph`);
        } else {
          result.push(connectedNode);
        }
      }
      return result;
    }, []);
  }

  outgoing(id : number , label=null) : ConnectedNode[] {
    return this.adjacent(id, DIR_OUT, label);
  }

  incoming(id : number, label=null) : ConnectedNode[] {
    return this.adjacent(id, DIR_IN, label);
  }

  incidentEdges(id:number, direction:boolean =DIR_OUT) : ValidEdge[] {
    let directionalIndex
    if (direction == DIR_OUT) directionalIndex = this.outgoingE;
    if (direction == DIR_IN) directionalIndex = this.incomingE;
    if (directionalIndex === undefined) {
      throw new Error("direction must be either DIR_OUT or DIR_IN");
    }

    const edgeList = directionalIndex.get(id);
    
    if (edgeList === undefined) {
      throw new Error(`incidentEdges: no node with id ${id} in the graph`);
    }

    return edgeList.map(adj => {
      const edge = this._edges.get(adj)
      if (edge === undefined) {
        throw new Error(`incidentEdges: edge ${adj} is listed for node ${id} but missing from the graph`);
      }
      return edge;
    });

  }

  outgoingEdges(id : number) : Edge[] {
    return this.incidentEdges(id, DIR_OUT);
  }

  incomingEdges(id : number) : Edge[] {
    return this.incidentEdges(id, DIR_IN);
  }

  removeNode(node : Node | number) {
    const nodeId = node instanceof Node ? node.id : node;

    for (const edgeId of this.outgoingE.get(nodeId)) {
      const toId = this._edges.get(edgeId).to.id;

      const incomingNodeIndex = this._incoming.get(toId).indexOf(nodeId);
      this._incoming.get(toId).splice(incomingNodeIndex, 1);

      const incomingEdgeIndex = this.incomingE.get(toId).indexOf(edgeId);
      this.incomingE.get(toId).splice(incomingEdgeIndex, 1);

      this._edges.delete(edgeId);
    }

    for (const edgeId of this.incomingE.get(nodeId)) {
      const fromId = this._edges.get(edgeId).from.id;

      const outgoingNodeIndex = this._outgoing.get(fromId).indexOf(nodeId);
      this._outgoing.get(fromId).splice(outgoingNodeIndex, 1);

      const outgoingEdgeIndex = this.outgoingE.get(fromId).indexOf(edgeId);
      this.outgoingE.get(fromId).splice(outgoingEdgeIndex, 1);

      this._edges.delete(edgeId);
    }

    this._nodes.delete(nodeId);
  }

  removeEdge(edge : number | Edge ) {
    
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
    if (fromId  === undefined || toId  === undefined ) return;

    const outgoingNeighborIds = this._outgoing.get(fromId);
    const incomingNeighborIds = this._incoming.get(toId);
    const outgoingEdgeIds = this.outgoingE.get(fromId)
    const incomingEdgeIds = this.incomingE.get(toId)
    
    // if the to and from node / edge ID's are not in the appropriate lists , no op
    if (!outgoingNeighborIds || !incomingNeighborIds || !outgoingEdgeIds || !incomingEdgeIds) return;

    const toIndex = outgoingNeighborIds.indexOf(toId);
    outgoingNeighborIds.splice(toIndex, 1);

    const fromIndex = incomingNeighborIds.indexOf(fromId);
    incomingNeighborIds.splice(fromIndex, 1);

    const outgoingEdgeIndex = outgoingEdgeIds.indexOf(edgeId);
    outgoingEdgeIds.splice(outgoingEdgeIndex, 1);

    const incomingEdgeIndex = incomingEdgeIds.indexOf(edgeId);
    incomingEdgeIds.splice(incomingEdgeIndex, 1);

    this._edges.delete(edgeId);
  }
}

export default IncidenceList;
