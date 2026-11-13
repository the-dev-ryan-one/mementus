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

import Graph from "../graph.ts";

// module level, above the class
export const toNumber = (val: unknown): number | undefined => {
  if (typeof val === "number") return Number.isFinite(val) ? val : undefined;
  if (typeof val === "string" && val.trim() !== "") {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
};

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

  /** Replaces each item with its id.
   *
   * @example
   * graph.n().id().all(); // [2, 3]
   */
  id(): Traversal {
    this.chain.connect(IdStep);
    return this;
  }

  /**
   * Replaces each item with its label.
   *
   * @example
   * graph.n().label().all(); // the label of every node
   */
  label(): Traversal {
    this.chain.connect(LabelStep);
    return this;
  }

  /**
   * Replaces each item with its props object.
   *
   * @example
   * graph.e(10).props().one(); // { tag: "marked" }
   */
  props(): Traversal {
    this.chain.connect(PropsStep);
    return this;
  }

  /**
   * Replaces each item with the value of one of its props.
   *
   * @param name - The key of the prop to read.
   *
   * @example
   * graph.n(1).outE().prop("age").all(); // ["35", "21", "18"]
   */
  prop(name: string): Traversal {
    this.chain.connect(PropStep, name);
    return this;
  }

  /**
   * Moves from each node to the nodes at the end of its outgoing edges.
   *
   * @param label - Selects which outgoing edges to follow:
   *   - omitted or `null`: all of them
   *   - a string: only edges with that label
   *
   * @example
   * graph.n(1).out().all();         // nodes that node 1 points to
   * graph.n(1).out("canopy").all(); // only via edges labelled "canopy"
   */
  out(label: string | null = null): Traversal {
    this.chain.connect(OutStep, this.graph, label);
    return this;
  }

  /**
   * Moves from each node to the nodes at the start of its incoming edges.
   *
   * @param label - Selects which incoming edges to follow:
   *   - omitted or `null`: all of them
   *   - a string: only edges with that label
   *
   * @example
   * graph.n(3).in().all();         // nodes that point to node 3
   * graph.n(3).in("canopy").all(); // only via edges labelled "canopy"
   */
  in(label: string | null = null): Traversal {
    this.chain.connect(InStep, this.graph, label);
    return this;
  }

  /**
   * Alias of `in()`.
   */
  inc(label: string | null = null): Traversal {
    this.chain.connect(InStep, this.graph, label);
    return this;
  }

  /**
   * Moves from each node to its outgoing edges.
   *
   * @param label - Selects which outgoing edges to return:
   *   - omitted or `null`: all of them
   *   - a string: only edges with that label
   *
   * @example
   * graph.n(1).outE().all();         // the edges leaving node 1
   * graph.n(1).outE("canopy").all(); // only edges labelled "canopy"
   */
  outE(label: string | null = null): Traversal {
    this.chain.connect(OutEStep, this.graph, label);
    return this;
  }

  /**
   * Moves from each node to its incoming edges.
   *
   * @param label - Selects which incoming edges to return:
   *   - omitted or `null`: all of them
   *   - a string: only edges with that label
   *
   * @example
   * graph.n(3).inE().all();         // the edges arriving at node 3
   * graph.n(3).inE("canopy").all(); // only edges labelled "canopy"
   */
  inE(label: string | null = null): Traversal {
    this.chain.connect(InEStep, this.graph, label);
    return this;
  }

  /**
   * Replaces each item with the result of a function.
   *
   * @param transform - Called with each item; whatever it returns is passed on.
   *
   * @example
   * graph.n().id().map((id) => id * 10).all(); // each node id multiplied by 10
   */
  map<InType, OutType>(transform: (input: InType) => OutType): Traversal {
    this.chain.connect(MapStep, transform);
    return this;
  }

  /**
   * Keeps only the nodes (or edges) for which a small query returns true.
   *
   * @param predicate - Receives a traversal that starts at the current node.
   *   Run a query from it and return true to keep the node, false to drop it.
   *
   * @example
   * // nodes that have at least one outgoing edge labeled "canopy"
   * graph
   *   .n()
   *   .where((t) => t.out("canopy").all().length > 0)
   *   .id()
   *   .all(); // [1, 2]
   */
  where(predicate: (input: Traversal) => boolean): Traversal {
    this.chain.connect(WhereStep, predicate, this.graph, Traversal);
    return this;
  }

  /**
   * Keeps only the items (nodes, edges or values) for which a function returns
   * true.
   *
   * @param predicate - Receives the current item itself. Return true to keep it,
   *   false to drop it.
   *
   * @example
   * // nodes with an id greater than or equal to 2
   * graph
   *   .n()
   *   .filter((node) => node.id >= 2)
   *   .id()
   *   .all(); // [2, 3]
   */
  filter(predicate: (input: Traversal) => boolean): Traversal {
    this.chain.connect(FilterStep, predicate);
    return this;
  }

  /**
   * Runs two subqueries starting from each node (or edge) that reaches this
   * step, and merges their results into one list.
   *
   * @param base - Receives a traversal that starts at the current node. Returns
   *   the value or array of values to include in the output.
   * @param other - Same as `base`. Its results come after those of `base`.
   *
   * @example
   * // for node 2: the nodes it points to, then the nodes that point to it
   * graph
   *   .n(2)
   *   .union(
   *     (t) => t.out().id().all(),
   *     (t) => t.in().id().all(),
   *   )
   *   .all(); // [3, 1]
   */
  union<Tout>(base: (input: Traversal) => Tout | Tout[], other: (input: Traversal) => Tout | Tout[]): Traversal {
    this.chain.connect(UnionStep, this.graph, base, other, Traversal);
    return this;
  }

  /**
   * Runs the traversal and returns the first result, or `undefined` if there
   * are none.
   *
   * @example
   * graph.n().id().one(); // [1]
   */
  one(): unknown {
    const producer = this.chain.process();
    this.reset();
    return producer.next().value;
  }

  /**
   * Runs the traversal and returns every result as an array.
   *
   * @example
   * graph.n().id().all(); // [2, 3, 4]
   */
  all(): unknown[] {
    const result = [...this.chain.process()];
    this.reset();
    return result;
  }

  /**
   * Runs the traversal and returns at most the first `num` results.
   *
   * @param num - The maximum number of results to return.
   *
   * @example
   * graph.n().id().take(2); // [1, 2]
   */
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

  /**
   * Runs the traversal and returns how many results it produced. Duplicates
   * are counted, and an empty traversal returns `0`.
   *
   * @example
   * graph.n().count();       // 3
   * graph.n(1).out().count(); // how many nodes node 1 points to
   */
  count(): number {
    let count = 0;
    for (const _ of this.chain.process()) count++;
    this.reset();
    return count;
  }

  /**
   * Runs the traversal and returns how many different results it produced.
   * Results that map to the same key are counted once. Results whose key is
   * `undefined` or `null` are skipped, and an empty traversal returns `0`.
   *
   * @param key - Called with each result; whatever it returns decides which
   *   results count as the same. Omitted: the result itself, so objects are
   *   compared by reference and plain values by value.
   *
   * @example
   * graph.n(1).out().out().countDistinct();    // each node once, however many paths reach it
   * graph.n().countDistinct((n) => n.label);   // how many different labels
   * graph.e().countDistinct((e) => e.id);      // edges compared by id
   */
  countDistinct(key: (item: unknown) => unknown = (item) => item): number {
    const seen = new Set<unknown>();
    for (const item of this.chain.process()) {
      const keyed = key(item);
      if (!(keyed === undefined || keyed === null)) {
        seen.add(keyed);
      }
    }
    this.reset();
    return seen.size;
  }

  /**
   * Runs the traversal and returns the largest numeric value it produced.
   * Numeric strings such as `"35"` are converted to numbers. Results whose key
   * is `undefined` or `null` are skipped, and an empty traversal returns
   * `undefined`.
   *
   * @param key - Decides which value to compare for each result:
   *   - omitted: the result itself
   *   - a string: shorthand for a function, so `"age"` is the same as
   *     `(x) => x?.props?.age`
   *   - a function: whatever it returns is compared
   *
   * @throws If a key is not `undefined`, `null`, a number or a numeric string.
   *
   * @example
   * graph.n().max("age");                  // maximum "age" prop
   * graph.n().max((n) => n?.props?.age);   // maximum "age" prop
   */
  max(key: string | (item: any) => unknown = (item) => item): number | undefined {

    if (typeof(key) === "string") {
      const propKeyName = key
      key = (x) => x?.props?.[propKeyName]
    }

    let largest: number | undefined;
    try {
      for (const item of this.chain.process()) {
        const keyed = key(item);
        if (keyed === undefined || keyed === null) continue;

        const n = toNumber(keyed);
        if (n === undefined) {
          throw new Error(`Cannot aggregate non-numeric value: ${String(keyed)}. Check your key function returns numbers.`);
        }
        if (largest === undefined || n > largest) largest = n;
      }
    } finally {
      this.reset();
    }
    return largest;
  }

    /**
   * Returns the smallest number among the results, or `undefined` if there are
   * none. Numeric strings like `"35"` are converted, and `null` or `undefined`
   * values are skipped.
   *
   * @param key - What to compare: omitted (the result itself), a prop name
   *   (`"age"` is shorthand for `(x) => x?.props?.age`), or a function.
   *
   * @throws If a value is not a number or numeric string.
   *
   * @example
   * graph.n().min("age");         // the lowest age
   * graph.n().prop("age").min();  // same, on plain values
   */
  min(key: string | (item: any) => unknown = (item) => item): number | undefined {

    if (typeof(key) === "string") {
      const propKeyName = key
      key = (x) => x?.props?.[propKeyName]
    }

    let smallest: number | undefined;
    try {
      for (const item of this.chain.process()) {
        const keyed = key(item);
        if (keyed === undefined || keyed === null) continue;

        const n = toNumber(keyed);
        if (n === undefined) {
          throw new Error(`Cannot aggregate non-numeric value: ${String(keyed)}. Check your key function returns numbers.`);
        }
        if (smallest === undefined || n < smallest) smallest = n;
      }
    } finally {
      this.reset();
    }
    return smallest;
  }

  /**
   * Returns the mean of the numbers among the results, or `undefined` if
   * there are none. Numeric strings like `"35"` are converted, and `null` or
   * `undefined` values are skipped (they don't count toward the average).
   *
   * @param key - What to average: omitted (the result itself), a prop name
   *   (`"age"` is shorthand for `(x) => x?.props?.age`), or a function.
   *
   * @throws If a value is not a number or numeric string.
   *
   * @example
   * graph.n().mean("age");         // the average age
   * graph.n().prop("age").mean();  // same, on plain values
   */
  mean(key: string | (item: any) => unknown = (item) => item): number | undefined {

    if (typeof(key) === "string") {
      const propKeyName = key
      key = (x) => x?.props?.[propKeyName]
    }

    let accum: number = 0;
    let count: number = 0;
    try {
      for (const item of this.chain.process()) {
        const keyed = key(item);
        if (keyed === undefined || keyed === null) continue;

        const n = toNumber(keyed);
        if (n === undefined) {
          throw new Error(`Cannot aggregate non-numeric value: ${String(keyed)}. Check your key function returns numbers.`);
        }
        accum += n;
        count++;
      }
    } finally {
      this.reset();
    }

    if (count === 0) return undefined;
    return (accum/count);
  }

  /**
   * Returns the total of the numbers among the results, or `undefined` if
   * there is nothing to add. Numeric strings like `"35"` are converted, and
   * `null` or `undefined` values are skipped.
   *
   * @param key - What to add: omitted (the result itself), a prop name
   *   (`"age"` is shorthand for `(x) => x?.props?.age`), or a function.
   *
   * @throws If a value is not a number or numeric string.
   *
   * @example
   * graph.n().sum("age");         // the total of all ages
   * graph.n().prop("age").sum();  // same, on plain values
   */
  sum(key: string | (item: any) => unknown = (item) => item): number | undefined {

    if (typeof(key) === "string") {
      const propKeyName = key
      key = (x) => x?.props?.[propKeyName]
    }

    let sum: number = 0;
    let count: number = 0;
    try {
      for (const item of this.chain.process()) {
        const keyed = key(item);
        if (keyed === undefined || keyed === null) continue;

        const n = toNumber(keyed);
        if (n === undefined) {
          throw new Error(`Cannot aggregate non-numeric value: ${String(keyed)}. Check your key function returns numbers.`);
        }
        sum += n;
        count++;
      }
    } finally {
      this.reset();
    }

    if (count === 0) return undefined;
    return sum;
  }

  

  /**
   * Runs the traversal lazily, returning an iterator that produces one result
   * at a time.
   *
   * @example
   * for (const id of graph.n().id().run()) { ... }
   */
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
