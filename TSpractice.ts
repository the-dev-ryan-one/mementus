
function* countUp(n : number) : Generator<number> {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

function* repeat<T>(item : T, times : number) : Generator<T> {
  // yield `item`, `times` times
  let i = 0
  while ( i < times ) {
    yield item
    i++
  }
}

function* flatten<T>(iterables: Iterable<T>[]) {
  
  for (const element of iterables) {
    yield* element
  }
}

// interface Feed<T> {
//   pull(): Generator<T>;
// }

class ArrayFeed<T> implements Feed<T> {

  constructor(private items: T[]) {}

  *pull(): Generator<T> {
    // ...
    yield* this.items
  }
}

class RangeFeed implements Feed<number> {
  constructor(private start: number, private end: number) {}
  *pull(): Generator<number> {
    // ...
    let i = this.start
    while ( i < this.end ) {
      yield i
      i++
    }
  }
}

function pluckId<T extends { id: number }>(x: T): number {
  return x.id;
}

interface HasMeta<M> {
  meta: M;
}

// T extends HasMeta<M> = whatever T is it must have a key value pair of meta : M
// M = Record<string, unknown>> = M is of the shape Record<string, unknown>
// implements Feed<M> = M has have generator function called pull which yeilds M type items
class MetaFeed<T extends HasMeta<M>, M = Record<string, unknown>> implements Feed<M> {

  constructor(private source: Feed<T>) {}

  *pull(): Generator<M> {
    // ...
    for (const item of this.source.pull() ) {
      yield item.meta
    }
  }

}

interface Feed<T> {
  pull(): Generator<T>;
}

class Transformer<T, U> implements Feed<U> {
  constructor(private source: Feed<T>, private transform: (item: T) => U) {}
  *pull(): Generator<U> {
    for (const item of this.source.pull()) {
      yield this.transform(item);
    }
  }
}

class Sieve<T> implements Feed<T> {

  constructor( private source: Feed<T>  , private predicate: (item: T) => boolean) {}

  *pull(): Generator<T> {
    // ...
    for ( const x of this.source.pull() ) {
      
      if ( this.predicate(x) === true ) {
        yield x
      }
    }

  }
}

class SieveNarrowing<T, S extends T> implements Feed<S> {

  constructor(private source: Feed<T>, private predicate: (item: T) => item is S) {}

  *pull(): Generator<S> {
    // ...
    for ( const x of this.source.pull() ) {
      if ( this.predicate(x) ) {
        yield x
      }
    }

  }
}

class Counter {
  count = 0;
  increment() { this.count++; }
}

// holds the actualy class
const CounterClass: typeof Counter = Counter;

function make<T>(Ctor : new () => T ): T {
  return new Ctor();
}


class Greeting {

  constructor( public name: string, public times: number) {}

  say() { 
    return Array(this.times).fill(`hi ${this.name}`); 
  }

}

function build(Ctor : typeof Greeting, ...args : [name:string, times:number] ) {

  return new Ctor(...args);

}

// self-check
const g = build(Greeting, "Ada", 3);
console.log(g.say()); // ["hi Ada", "hi Ada", "hi Ada"]






