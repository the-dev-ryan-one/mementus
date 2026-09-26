import Graph from "../../graph.js";
import Edge from "../../edge.ts";

// notes about this file: i think this port is correct
// Type 'Edge<propKVpairs> | undefined' is not assignable to type 'Edge<propKVpairs>'.
// Type 'undefined' is not assignable to type 'Edge<propKVpairs>'.
// I think this comes from the .get(id) on the map in
// incidence-list , will take a look at that

interface Pipe<T> {
  process() : Generator<T>
}

class OutEStep<Tin extends {id:number}> implements Pipe<Edge>{

  pipe : Pipe<Tin>;
  graph : Graph;

  constructor(pipe : Pipe<Tin>, graph : Graph) {
    this.pipe = pipe;
    this.graph = graph;
    //console.log("+++++++++++++++++++++>" , this.graph )
  }

  *process() : Generator<Edge> {
    for (const node of this.pipe.process()) {
      //console.log("+++++++++++++++++++++>" , node )
      //console.log("**********************>>> " , this.graph.outgoingEdges(node.id))

      yield* this.graph.outgoingEdges(node.id);
    }
  }

  toString() : string {
    return "[OutEStep]";
  }
}

export default OutEStep;
