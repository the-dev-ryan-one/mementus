import Graph from "../../graph.js";
import Traversal from "../../../src/pipeline/traversal.js";

interface Pipe<T> {
  process(): Generator<T>;
}

// if it takes and returns connected nodes only maybe i can just use Pipe<ConnectedNode>
class WhereStep<T> implements Pipe<T> {

  pipe : Pipe<T>;
  predicate : (input: InstanceType<typeof Traversal>) => boolean;
  graph : Graph;
  traverser : typeof Traversal;

  constructor(source:Pipe<T>, predicate : (input: InstanceType<typeof Traversal> ) => boolean , graph:Graph , traverser:typeof Traversal ) {
    this.pipe = source;
    this.predicate = predicate;
    this.graph = graph;
    this.traverser = traverser;
  }

  *process() : Generator<T> {
    for (const element of this.pipe.process()) {
      const subtraversal = new this.traverser([element], this.graph);
      if (this.predicate(subtraversal)) yield element;
    }
  }

  toString() : string {
    return "[WhereStep]";
  }
}

export default WhereStep;
