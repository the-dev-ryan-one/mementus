import IncidenceList from "./structure/incidence-list.ts";
import IntegerId from "./integer-id.js";
import Mutators from "./mutators.js";

class GraphBuilder {
  structure: IncidenceList;
  nodeIds: IntegerId;
  edgeIds: IntegerId;

  constructor() {
    this.structure = new IncidenceList();
    this.nodeIds = new IntegerId();
    this.edgeIds = new IntegerId();
  }

  nextNodeId(): number {
    return this.nodeIds.nextId();
  }

  nextEdgeId(): number {
    return this.edgeIds.nextId();
  }

  graph(): IncidenceList {
    return this.structure;
  }
}

// console.log("GraphBuilder.prototype ------- ", GraphBuilder.prototype);
// console.log("Mutators ----------- ", Mutators);
// sets the prototype of the graphbuilder class to Mutators
// net result is that Graphbuilder instances have access to the methods in
// mutators (ie Mutators is a mixin).
Object.assign(GraphBuilder.prototype, Mutators);

export default GraphBuilder;
