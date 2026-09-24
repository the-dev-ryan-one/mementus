interface Pipe<T> {
  process() : Generator<T>;
}

type Step <Tin,Tout> = {

  pipe : Pipe<Tin>;
  process() : Generator<Tout>;
  toString() : string;

}

class CollectionSource <T> implements Pipe<T>{

  collection : T[];

  constructor(collection : T[]) {
    // this.collection is an array because  new CollectionSource(source) in Source
    this.collection = collection;
    // console.log("***************** example of this.collection: " , this.collection);
  }

  // the collection source class has a generator method which will yield
  *process() : Generator<T> {
    // console.log("yield delegation: " , this.collection);
    yield * this.collection;
  }

  toString() : string {
    return "[CollectionSource]";
  }

}

// difficult part of the port , will revisit
class Source<T , U> {

  pipe : Pipe<T>
  
  constructor(source : T[]) {
    if (Array.isArray(source)) {
      this.pipe = new CollectionSource(source);
    } else {
      throw new Error("Source must be an array (for now)");
    }
  }

  connect(step : Step<Tin,Tout>, ...args : U[]) {
    this.pipe = new step(this.pipe, ...args);
  }

  *process() : Generator<T> {
    yield* this.pipe.process();
  }
}


export default Source;