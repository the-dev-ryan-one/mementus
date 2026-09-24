import IncidenceList from "./structure/incidence-list.ts";
import IntegerId from "./integer-id.js";
import Mutators from "./mutators.js";

class GraphBuilder {

  structure : IncidenceList;
  nodeIds : IntegerId;
  edgeIds : IntegerId;

  constructor() {
    this.structure = new IncidenceList();
    this.nodeIds = new IntegerId();
    this.edgeIds = new IntegerId();
  }

  nextNodeId() : number {
    return this.nodeIds.nextId();
  }

  nextEdgeId() : number {
    return this.edgeIds.nextId();
  }

  graph() : IncidenceList{
    return this.structure;
  }
}

Object.assign(GraphBuilder.prototype, Mutators);

export default GraphBuilder;
