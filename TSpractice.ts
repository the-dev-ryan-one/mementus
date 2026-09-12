
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

const numTostringConverter = new Transformer2<number, string>( (num) => num === 5 ? "five" : "not five" )
















