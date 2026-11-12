// basically hasProcess
export interface Pipe<T> {
  process(): Generator<T>;
}

// extends Pipe<Out> = Step has a process() which yeilds Out (ie process(): Generator<Out>)
export interface Step<In, Out> extends Pipe<Out> {
  pipe: Pipe<In>; // Step has a field called pipe of type Pipe<In>
}

// type StepConstructor<In, Out> = new (param1: Pipe<In>, ...param2: unknown[]) => Step<In, Out>;
type StepConstructor = new (pipe: any, ...args: any[]) => Pipe<unknown>;

class CollectionSource<T> implements Pipe<T> {
  collection: T[];

  constructor(collection: T[]) {
    this.collection = collection;
  }

  *process(): Generator<T> {
    yield* this.collection;
  }

  toString(): string {
    return "[CollectionSource]";
  }
}

class Source {
  // typed as unknown on purpose, connect() mutates this.pipe and each step can change the
  // type, so no single type fits the chain. revisit later
  pipe: Pipe<unknown>;

  constructor(source: unknown[]) {
    if (Array.isArray(source)) {
      this.pipe = new CollectionSource(source);
    } else {
      throw new Error("Source must be an array (for now)");
    }
  }

  // connect is called on this.chain
  connect(step: StepConstructor, ...args: unknown[]) {
    this.pipe = new step(this.pipe, ...args);
  }

  *process(): Generator<unknown> {
    yield* this.pipe.process();
  }
}

export default Source;
