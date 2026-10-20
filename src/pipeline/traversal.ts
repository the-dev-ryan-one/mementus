import Source from "./source.ts";
import MapStep from "./steps/map-step.ts";
import FilterStep from "./steps/filter-step.ts";
import WhereStep from "./steps/where-step.ts";
import UnionStep from "./steps/union-step.ts";
import IdStep from "./steps/id-step.ts";
import LabelStep from "./steps/label-step.ts";
import PropsStep from "./steps/props-step.ts";
import PropStep from "./steps/prop-step.ts";
import OutStep from "./steps/out-step.ts";
import InStep from "./steps/in-step.ts";
import OutEStep from "./steps/out-e-step.ts";
import InEStep from "./steps/in-e-step.ts";

import { isStep } from "./source.ts";
import Graph from "../graph.ts";

class Traversal {
  chain!: Source;
  graph?: Graph;
  input: unknown[];

  constructor(input: unknown[], graph?: Graph) {
    this.input = input;
    this.graph = graph;
    this.reset();
  }

  reset() {
    this.chain = new Source(this.input);
  }

  id(): Traversal {
    // this.chain is a Source . connect is called and ||| this.pipe = new step(this.pipe, ...args);
    //console.log("before connect :     ", this.chain.pipe);
    this.chain.connect(IdStep);
    //console.log("After connect :     ", this.chain.pipe);
    return this;
  }

  label(): Traversal {
    this.chain.connect(LabelStep);
    return this;
  }

  props(): Traversal {
    this.chain.connect(PropsStep);
    return this;
  }

  prop(name: string): Traversal {
    //console.log("-----------------");
    console.log("here 2");
    this.chain.connect(PropStep, name);
    //console.log("----------this-------> ", this);
    //console.log("-----------------");
    return this;
  }

  out(label = null): Traversal {
    //console.log("333333333333333333", label);
    this.chain.connect(OutStep, this.graph, label);
    return this;
  }

  inc(label = null): Traversal {
    this.chain.connect(InStep, this.graph, label);
    //console.log(".inc() output -------------------> " , this );
    return this;
  }

  in(label = null): Traversal {
    this.chain.connect(InStep, this.graph, label);
    return this;
  }

  outE(): Traversal {
    this.chain.connect(OutEStep, this.graph);
    return this;
  }

  inE(): Traversal {
    this.chain.connect(InEStep, this.graph);
    return this;
  }

  map<InType, OutType>(transform: (input: InType) => OutType): Traversal {
    this.chain.connect(MapStep, transform);
    return this;
  }

  where(predicate: (input: Traversal) => boolean): Traversal {
    this.chain.connect(WhereStep, predicate, this.graph, Traversal);
    return this;
  }

  filter(predicate: (input: Traversal) => boolean): Traversal {
    this.chain.connect(FilterStep, predicate);
    return this;
  }

  union<Tout>(base: (input: Traversal) => Tout | Tout[], other: (input: Traversal) => Tout | Tout[]): Traversal {
    this.chain.connect(UnionStep, this.graph, base, other, Traversal);
    return this;
  }

  one(): unknown {
    const producer = this.chain.process();
    this.reset();
    return producer.next().value;
  }

  all(): unknown[] {
    console.log("here 3");
    const result = [...this.chain.process()];
    this.reset();
    //console.log(".all() output ------------------->" , result );
    return result;
  }

  take(num: number): unknown[] {
    const producer = this.chain.process();
    this.reset();

    const result = [];

    for (let n = 0; n < num; n++) {
      const current = producer.next();
      if (current.done) break;
      result.push(current.value);
    }

    return result;
  }

  run(): Generator<unknown> {
    return this.chain.process();
  }

  toString(): string {
    let out = [];
    let pipe = this.chain.pipe;
    while (pipe != null) {
      out.unshift(pipe);
      pipe = pipe.pipe;
    }
    return out.join("->");
  }
}

export default Traversal;
