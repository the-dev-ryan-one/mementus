import Edge from "../../edge.ts";
import Graph from "../../graph.js";

interface Pipe<T> {
  process(): Generator<T>;
}

class InEStep<T extends { id: number }> implements Pipe<Edge> {
  pipe: Pipe<T>;
  graph: Graph;

  constructor(pipe: Pipe<T>, graph: Graph) {
    this.pipe = pipe;
    this.graph = graph;
  }

  *process(): Generator<Edge> {
    for (const node of this.pipe.process()) {
      yield* this.graph.incomingEdges(node.id);
    }
  }

  toString(): string {
    return "[InEStep]";
  }
}

export default InEStep;
