import Graph from "../../graph.js";
import Edge from "../../edge.ts";

// notes about this file: i think this port is correct
// Type 'Edge<propKVpairs> | undefined' is not assignable to type 'Edge<propKVpairs>'.
// Type 'undefined' is not assignable to type 'Edge<propKVpairs>'.
// I think this comes from the .get(id) on the map in
// incidence-list , will take a look at that

interface Pipe<T> {
  process(): Generator<T>;
}

class OutEStep<Tin extends { id: number }> implements Pipe<Edge> {
  pipe: Pipe<Tin>;
  graph: Graph;
  label: string | null;

  constructor(pipe: Pipe<Tin>, graph: Graph, label: string | null = null) {
    this.pipe = pipe;
    this.graph = graph;
    this.label = label;
  }

  *process(): Generator<Edge> {
    for (const node of this.pipe.process()) {
      yield* this.graph.outgoingEdges(node.id, this.label);
    }
  }

  toString(): string {
    return "[OutEStep]";
  }
}

export default OutEStep;
