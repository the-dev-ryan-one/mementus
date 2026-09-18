
class Dog {

  name:string
  age:number
  weight:number

  constructor( name:string, age:number, weight:number ) {
    this.name = name
    this.age = age
    this.weight = weight
  }
}

type dogParamsList = ConstructorParameters<typeof Dog>

const x:dogParamsList = ["**" , 3 , 2]

type dogInstanceType = InstanceType<typeof Dog>

class Bar {

  name: string
  established: number

  constructor( name:string , established:number ) {
    this.name = name
    this.established = established
  }
}

type BarArgs = ConstructorParameters<typeof Bar>
const variableExample = ["Dolly" , "2020"]
type BarInstance = InstanceType<typeof Bar>
const bar2:BarInstance = new Bar("Bar2" , 1999)


// <C extends new(...args:any[]) => any > , this part says that whatever object is used in ConstructorParameters<C> will satisfy the constraint 
// of having the form of a constructor function
function instantiate<C extends new(...args:any[]) => any >(Ctor:C, ...args:ConstructorParameters<C>): InstanceType<C> {
  
  const newInstance:InstanceType<C> = new Ctor(...args)
  return newInstance

}

class hotel {

  name: string
  occupancy: number

  constructor(name:string , occupancy:number) {
    this.name = name
    this.occupancy = occupancy
  }
}

interface Pipe<T> { process(): Generator<T>; }


function makeAddStep(pipe: Pipe<number>, amount: number): Pipe<number> {
  // TODO
  return new AddStep(pipe , amount)
}

function connectStep<R extends unknown[]> (
  pipe: Pipe<number>,
  Step: new (pipe: Pipe<number>, ...rest: R) => Pipe<number>, 
  ...rest: R 
  ): Pipe<number> {
  // TODO
  return new Step(pipe , ...rest)
}

class ClampStep implements Pipe<number>{

  pipe: Pipe<number>
  min: number
  label: string

  constructor( pipe: Pipe<number>, min: number, label: string ) {
    this.pipe = pipe
    this.min = min
    this.label = label
  }

  *process() {

    for ( const n of this.pipe.process() )
    yield Math.max(this.min , n)

  }
}


// const chain = new Chain([1, 2, 3]);
// chain.connect(AddStep, 10);
// chain.connect(ClampStep, 15, "floor");
// console.log([...chain.process()]);

class Box<T> {

  constructor(private value: T) {}

  transform<U>(fn: (value: T) => U): Box<U> {
    // TODO
    return new Box( fn(this.value) )

  }

  get(): T {
    // TODO
    return this.value
  }
}

interface Pipe<T> {
  process(): Generator<T>;
}

class ArraySource<T> implements Pipe<T> {
  constructor(private items: T[]) {}
  *process(): Generator<T> { yield* this.items; }
}

class DoubleStep implements Pipe<number> {
  constructor(private pipe: Pipe<number>) {}
  *process(): Generator<number> {
    for (const n of this.pipe.process()) yield n * 2;
  }
}

class AddStep implements Pipe<number> {
  constructor(private pipe: Pipe<number>, private amount: number) {}
  *process(): Generator<number> {
    for (const n of this.pipe.process()) yield n + this.amount;
  }
}

class ToStringStep implements Pipe<string> {
  constructor(private pipe: Pipe<number>) {}
  *process(): Generator<string> {
    for (const n of this.pipe.process()) yield String(n);
  }
}

class Chain implements Pipe<unknown> {
  pipe: Pipe<unknown>;

  constructor(source: unknown[]) {
    this.pipe = new ArraySource(source);
  }

  connect<TIn, TOut, R extends any[]>(
    Step: new (pipe: Pipe<TIn>, ...rest: R) => Pipe<TOut>,
    ...rest: R
  ): void {
    this.pipe = new Step(this.pipe as Pipe<TIn>, ...rest);
  }

  *process(): Generator<unknown> {
    yield* this.pipe.process();
  }
}

const chain = new Chain([1, 2, 3]);
chain.connect(AddStep, 10);      // extra arg, resolution-A + heterogeneous args combined
chain.connect(DoubleStep);       // no extra args
chain.connect(ToStringStep);     // changes T from number -> string
const result = [...chain.process()] as string[];
console.log(result);













