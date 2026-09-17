
function* countTo(n : number) : Generator<number> {

  let count:number = 0

  while(count < n){
    count++
    yield count
  }
}

function* logAndYield() : Generator {
  console.log("message 1")
  yield 1
  console.log("message 2")
  yield 2
  console.log("message 3")
  yield 3

}

function* wrapWhole(arr: number[]) : Generator<number[]> { 
  yield arr
}

function* wrapEach(arr: number[]) : Generator<number> { 
  yield* arr
}

class Countdown {

  start: number

  constructor(start:number) {
    this.start = start
  }

  *process() : Generator<number> {
    
    let i = this.start

    while (i > 0) {
      yield i
      i-- 
    }
  }
}

function* countTo2(n: number): Generator<number> {
  for (let i = 1; i <= n; i++) yield i;
}

function* doubleEach(source: Generator<number>) : Generator<number> {

  while (1) {
    const single = source.next().value
    console.log(single)
    yield single*2
  }
}

// defines a contract
interface HasName {
  name : string
}

class Dog {

  name : string
  height : number = 5
  weight : number = 5

  constructor(name:string) {
    this.name = name
    this.height = this.height
    this.weight = this.weight
  }
}

class Company {

  name : string
  numEmployees : number = 20
  bankBalance : number = 25

  constructor(name:string) {
    this.name = name
    this.numEmployees = this.numEmployees
    this.bankBalance = this.bankBalance
  }
}


// any input x passed into greet() must satisfy the interfact HasName 
function greet(x: HasName) {
  console.log( console.log(`hello ${x.name}`))
}

interface soundMaker {
  makeSound() : string
}

class Car {

  constructor() {

  }

  makeSound() : string {
    return "Honk"
  }
}

function playSound(input : soundMaker) {
  console.log(input.makeSound())
}

interface Counter {
  getValue(): number;
}

class myCounter implements Counter {
 
  constructor () {}

  getValue() : number {
    return 5
  }

}

function identity<T>(x:T) {
  return x
}

class Box<T> {

  value : T
  constructor(value : T) {
    this.value = value
  }

  get() : T {
    return this.value
  }
}

class Wrapper<T> {

  items: T[]

  constructor(items: T[]) {
    this.items = items
  }

  *process(): Generator<T> {
    let index = 0
    while (1) {
      yield this.items[index]
      index ++
    }
  }

}

function getId<T extends { id: number }>(x: T): number {
  return x.id
}

class Transformer2<TIn, TOut> {
  transform: (x: TIn) => TOut;

  constructor(transform: (x: TIn) => TOut) {
    this.transform = transform;
  }

  run(x: TIn): TOut {
    return this.transform(x);
  }
}

function* countTo3(n: number) {
  while(1) {
    yield n
    n --;
  }
}

class Countdown2 {

  start:number;

  constructor(start: number) {
    this.start = start;
  }

  *process(start : number) : Generator<number>{
    while( start > 1) {
      yield start;
      start --;
    }

  } 

}

function* doubleEach2(source : Generator<number>) {
  while(1) {
  let output1: number = source.next().value;
  yield output1*2
  }

}

interface HasName2 {
  name: string;
}


interface Soundmaker {
  makeSound(): void;
}


class Dog2 implements Soundmaker{
  name2 : string;

  constructor(name: string) {
    this.name2 = name;
  }

  makeSound() {
    console.log("Bark")
  }
}

class Company2 implements Soundmaker{
  name : string;

  constructor(name: string) {
    this.name = name;
  }

  makeSound() {
    console.log("Im a company")
  }
}

function greet2(inputClass : HasName2) {
  console.log(inputClass.name);
}

function identity2<T>(x: T): T {
  return x
}


class Wrapper2<T> {

  items: T[]
  constructor(items : T[]) {

    this.items = items
  }

  *process(): Generator<T> {

    for (let i = 0 ; i<this.items.length ; i++) {
      yield this.items[i]
    }
  }
}

function getId2<T extends {id: number}> (x:T) : number {
  return x.id
}

class Transformer3<TIn, TOut> {

  transformfunc : (x:TIn) => TOut

  constructor( transformfunc : (x:TIn) => TOut ) {
    this.transformfunc = transformfunc
  }

  run(x:TIn) : TOut {
    return this.transformfunc(x)
  }

}

function applyTwice( x: number, fn: (n:number) => number ) {
  return fn(fn(x))
}

class operation {

  operation: (a: number, b: number) => number
  
  constructor( operation : (a: number, b: number) => number) {
    this.operation = operation
  }

  compute( a: number , b:number ) {
    return this.operation(a,b)
  }

}

interface Describable { describe(): string; }
type DescribableConstructor = new (input: string) => Describable;

class class1 implements Describable {

  describe(): string {
    return "hello from class 1"
  }
}

class class2 implements Describable {

  describe(): string {
    return "hello from class 2"
  }
}

function build(Ctor: DescribableConstructor, input: string) : Describable {
  return new Ctor(input)
}




interface Pipe<T> {
  process() : Generator<T>
}

class ArraySource<T> implements Pipe<T> {

  items: T[]

  constructor(items : T[]) {
    this.items = items
  }

  *process(): Generator<T> {
    yield* this.items
  }

}

const ArraySourceInst = new ArraySource( [1,2,3,4] )

for (const item of ArraySourceInst.process()) {
  console.log( item )
}

class DoubleStep implements Pipe<number> {

  pipe: Pipe<number>

  constructor(pipe: Pipe<number>) {
    this.pipe = pipe
  }

  *process() : Generator<number> {
    for (const item of this.pipe.process() ) {
      yield item*2
    }
  }

}

class ToStringStep<T> implements Pipe<string> {

  pipe : Pipe<T>

  constructor( pipe : Pipe<T> ) {
    this.pipe = pipe
  }

  *process() : Generator<string> {
    for (const x of this.pipe.process() ) {
      yield String(x)
    }
  }
}

















