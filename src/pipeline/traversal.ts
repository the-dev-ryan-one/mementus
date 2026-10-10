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

class Traversal {
  // input
  // graph

  constructor(input, graph) {
    this.input = input;
    this.graph = graph;
    this.reset();
  }

  reset() {
    this.chain = new Source(this.input);
  }

  id() {
    this.chain.connect(IdStep);
    return this;
  }

  label() {
    this.chain.connect(LabelStep);
    return this;
  }

  props() {
    this.chain.connect(PropsStep);
    return this;
  }

  prop(name: string) {
    //console.log("333333333333333333", typeof name);
    this.chain.connect(PropStep, name);
    return this;
  }

  out(label = null) {
    //console.log("333333333333333333", label);
    this.chain.connect(OutStep, this.graph, label);
    return this;
  }

  inc(label = null) {
    this.chain.connect(InStep, this.graph, label);
    //console.log(".inc() output -------------------> " , this );
    return this;
  }

  in(label = null) {
    this.chain.connect(InStep, this.graph, label);
    return this;
  }

  outE() {
    this.chain.connect(OutEStep, this.graph);
    return this;
  }

  inE() {
    this.chain.connect(InEStep, this.graph);
    return this;
  }

  map(transform) {
    this.chain.connect(MapStep, transform);
    return this;
  }

  where(predicate) {
    this.chain.connect(WhereStep, predicate, this.graph, Traversal);
    return this;
  }

  filter(predicate) {
    this.chain.connect(FilterStep, predicate);
    return this;
  }

  union(base, other) {
    this.chain.connect(UnionStep, this.graph, base, other, Traversal);
    return this;
  }

  one() {
    const producer = this.chain.process();
    this.reset();
    return producer.next().value;
  }

  all() {
    const result = [...this.chain.process()];
    this.reset();
    //console.log(".all() output ------------------->" , result );
    return result;
  }

  take(num: number): number[] {
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

  run() {
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
