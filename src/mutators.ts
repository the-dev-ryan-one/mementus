import Node from "./node.ts";
import Edge from "./edge.ts";
//import GraphBuilder from "./graph-builder.ts";
//import Graph from "./graph.ts";
import IncidenceList from "./structure/incidence-list.ts";
import IntegerId from "./integer-id.ts";

interface HasStructure {
  structure: IncidenceList;
}

interface HasNodeIds {
  nodeIds: IntegerId;
}

//---------------
interface HasEdgeIds {
  edgeIds: IntegerId;
}

interface HasAddNode {
  addNode(): Node;
}

//----------------

type NodeDraft = Partial<NodeParams>;
type EdgeDraft = Partial<EdgeParams>;

type NodeParams = ConstructorParameters<typeof Node>[0];
type EdgeParams = ConstructorParameters<typeof Edge>[0];

const Mutators = {
  // this could be : Graph | GraphBuilder but maybe structural typing is better (HasStrucutre)
  setNode(this: HasStructure, node: Node) {
    // console.log("-$$-$$-$$-$$-$$-$$-", this);
    //console.log("################### ", node);
    this.structure.setNode(node);
  },

  setEdge(this: HasStructure, edge: Edge) {
    //console.log("################### ", edge);
    this.structure.setEdge(edge);
  },

  // this : Graphbuilder is probably an option
  // object : is passed to node constructor directly so much be of type Node constructor params
  addNode(this: HasStructure & HasNodeIds, object: NodeParams = {}): Node {
    if (!object.id) {
      object.id = this.nodeIds.nextId();
    }
    const node = new Node(object);
    this.structure.setNode(node);
    return node;
  },

  // -----------------------------------
  // ADDED ALL THESE CHECKS FOR NOW BUT WILL REVISIT
  addEdge(this: HasStructure & HasEdgeIds & HasAddNode, object: EdgeDraft = {}) {
    if (!object.id) {
      object.id = this.edgeIds.nextId();
    }

    if (!object.from) {
      object.from = this.addNode();
    }

    if (!object.to) {
      object.to = this.addNode();
    }

    assertEdgeParams(object);

    const edge = new Edge(object);
    this.structure.setEdge(edge);
    return edge;
  },

  //-------------------------------------

  createNode(this: HasStructure, builder: (g: NodeDraft) => void) {
    //const object = { id: null, label: null, props: {} };
    const object = { id: undefined, label: undefined, props: {} };

    // whatever builder is it can take an object
    builder(object);

    assertNodeParams(object);

    this.structure.setNode(new Node(object));
  },

  // builder is a callback function which sets fields of teh edge being created by
  // graph.createEdge or graphBuilder.createEdge
  createEdge(this: HasStructure, builder: (x: EdgeDraft) => void) {
    const object = { id: undefined, label: undefined, props: {}, from: undefined, to: undefined };

    builder(object);

    // make sure that builder mutates object in such a way that its valid input to edge constructor
    assertEdgeParams(object);

    this.structure.setEdge(new Edge(object));
  },
};

function assertNodeParams(draft: NodeDraft): asserts draft is NodeParams {
  if (draft === undefined) return;
  if (!(draft.id === undefined || Number.isInteger(draft.id))) {
    throw new Error(`createNode: "id" must be an integer if set`);
  }
  if (!(draft.label === undefined || typeof draft.label === "string")) {
    throw new Error(`createNode: "label" must be a string if set`);
  }
  if (!(
    draft.props === undefined ||
    (typeof draft.props === "object" && draft.props !== null && !Array.isArray(draft.props))
  )) {
    throw new Error(`createNode: "props" must be an object if set`);
  }
}

function assertEdgeParams(draft: EdgeDraft): asserts draft is EdgeParams {
  for (const key of ["from", "to"] as const) {
    const v = draft[key];
    if (!(v instanceof Node || typeof v === "number")) {
      throw new Error(`createEdge: "${key}" must be set to a Node or a number`);
    }
  }
}

export default Mutators;
