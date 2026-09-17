interface Pipe<T1> {
  process() : Generator<T1>;
}

class CollectionSource <T> implements Pipe<T>{

  collection : T[];

  constructor(collection : T[]) {
    this.collection = collection;
    // console.log("***************** example of this.collection: " , this.collection);
  }

  // yield* will yield a single item from this.collection
  *process() : Generator<T> {
    // console.log("yield delegation: " , this.collection);
    // note : yield * is yield delegation , will yield one collectionElement no the whole array
    yield * this.collection;
  }

  toString() : string {
    return "[CollectionSource]";
  }
}

class Source <T> implements Pipe<T>{

  pipe : Pipe<T>;

  constructor(source : T[]) {
    // console.log("***Source***: " , source)
    if (Array.isArray(source)) {
      this.pipe = new CollectionSource(source);
      // console.log("this.pipe example 1: " , this.pipe)
    } else {
      throw new Error("Source must be an array (for now)");
    }
  }

  connect(step : any , ...args : any ) {
    // console.log("step: " , step)
    // console.log("args: " , args)
    this.pipe = new step(this.pipe, ...args);
    // console.log("this.pipe example 2: " , this.pipe)
  }

  *process() : Generator<T> {
    // console.log("this.pipe.process() examples: ", this.pipe.process()) 
    yield* this.pipe.process();
  }
}


export default Source;