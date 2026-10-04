import ConnectedNode from "../../connected-node.ts";
import Graph from "../../graph.js";

interface Pipe<T> {
  process(): Generator<T>;
}

class OutStep<T extends { id: number }> implements Pipe<ConnectedNode> {
  pipe: Pipe<T>;
  graph: Graph;
  label: string | null;

  constructor(pipe: Pipe<T>, graph: Graph, label: string | null = null) {
    this.pipe = pipe;
    this.graph = graph;
    this.label = label;
  }

  *process(): Generator<ConnectedNode> {
    for (const node of this.pipe.process()) {
      yield* this.graph.outgoing(node.id, this.label);
    }
  }

  toString(): string {
    return "[OutStep]";
  }
}

export default OutStep;
