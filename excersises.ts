function identity<T>(x: T): T {
  return x;
}

const output1 = identity("hi");
const output2 = identity(4);

function first<T>(xs: T[]): T | undefined {
  return xs[0];
}

const testArray = [0, 1, 2, 3, 4, 5];

const element = first(testArray);

interface Box<T> {
  value: T;
}

class NumberBox implements Box<number> {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
}

function getId<T extends { id: number }>(x: T): T["id"] {
  return x.id;
}

getId({ id: 1 });
getId({ id: 1, name: "a" });
getId({ name: "a" });

function* count(n: number): Generator<number> {
  let numList = [];
  for (let i = 0; i < n; i++) {
    numList.push(i);
  }
  yield* numList;
}

const gen = count(10);

// for (let i = 0; i < 10; i++) {
//   console.log(gen.next().value);
// }

//-------------------------------------//
//-------------------------------------//
//-------------------------------------//
//-------------------------------------//

interface Pipe<T> {
  process(): Generator<T>;
}

interface Step<In, Out> extends Pipe<Out> {
  pipe: Pipe<In>; // Step has a field called pipe of type Pipe<In>
}

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

class MapStep<A, B> implements Step<A, B> {
  pipe: Pipe<A>;
  transformFunc: (a: A) => B;

  constructor(pipe: Pipe<A>, transform: (a: A) => B) {
    this.pipe = pipe;
    this.transformFunc = transform;
  }

  *process(): Generator<B> {
    for (const item of this.pipe.process()) {
      yield this.transformFunc(item);
    }
  }
}

const transformFunc = (x: number) => x + 0.3333333;

const numberSource = new CollectionSource([0, 1, 2, 3, 4, 5, 6, 9, 12, 22, 33, 44, 121]);

const newStep = new MapStep(numberSource, transformFunc);

for (const item of newStep.process()) {
  console.log("curr item: ", item);
}

class IdStep<T extends { id: unknown }> implements Step<T, T["id"]> {
  pipe: Pipe<T>;

  constructor(pipe: Pipe<T>) {
    this.pipe = pipe;
  }

  *process(): Generator<T["id"]> {
    for (const item of this.pipe.process()) {
      yield item.id;
    }
  }
}

const idSource = new CollectionSource([
  { id: 1, label: "label1" },
  { id: 2, label: "label2" },
  { id: 3, label: "label3" },
  { id: 4, label: "label4" },
]);

const idStep = new IdStep(idSource);

const squareId = (x: number) => x ** 2;

const transformStep = new MapStep(idStep, squareId);

// for (const item of transformStep.process()) {
//   console.log("item: ", item);
// }

// const p: Pipe<unknown> = transformStep;
// const q: Pipe<number> = p as Pipe<unknown>;

// type StepConstructor = new (pipe: any, ...args: any[]) => Pipe<unknown>;

// function connect(step: StepConstructor, ...args: unknown[]) {
//   /* new step(somePipe, ...args) */
// }
