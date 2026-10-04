import Graph from "../../graph.js";
import Traversal from "../traversal.js";

// notes about this file : ive typed base and other functions as
// returning Tout | Tout[] with proper knowledge
// of all the possible (valid) traversals can
// we place tighter bounds on this ? probably yes

interface Pipe<T> {
  process(): Generator<T>;
}

class UnionStep<Tin, Tout> implements Pipe<Tout> {
  pipe: Pipe<Tin>;
  graph: Graph;
  base: (input: Traversal) => Tout | Tout[];
  other: (input: Traversal) => Tout | Tout[];
  traverser: typeof Traversal;

  constructor(
    source: Pipe<Tin>,
    graph: Graph,
    base: (input: Traversal) => Tout | Tout[],
    other: (input: Traversal) => Tout | Tout[],
    traverser: typeof Traversal,
  ) {
    this.pipe = source;
    this.graph = graph;
    this.base = base;
    // console.log("---------------> " , this.base )
    this.other = other;
    this.traverser = traverser;
  }

  *process(): Generator<Tout> {
    let _base: Tout[] = [];
    let _other: Tout[] = [];

    for (const element of this.pipe.process()) {
      // console.log("1---------------> " , [element] )
      // console.log("2---------------> " , this.graph )
      //console.log("input to base ---------------> " , new this.traverser([element], this.graph))
      //console.log("output from base --------------->" , this.base(new this.traverser([element], this.graph)))
      _base = _base.concat(
        this.base(new this.traverser([element], this.graph)),
      );
      _other = _other.concat(
        this.other(new this.traverser([element], this.graph)),
      );
    }

    yield* new Set([..._base, ..._other]);
  }

  toString(): string {
    return "[UnionStep]";
  }
}

export default UnionStep;
