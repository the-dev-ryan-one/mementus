interface Pipe<T> {
  process() : Generator<T>;
}

class CollectionSource <collectionElement> implements Pipe<collectionElement>{

  collection : collectionElement[];

  constructor(collection : collectionElement[]) {
    this.collection = collection;
    // console.log("example of this.collection: " , this.collection);
  }

  *process() : Generator<collectionElement> {
    // console.log("yield delegation: " , this.collection);
    // note : yield * is yield delegation , will yield one collectionElement no the whole array
    yield * this.collection;
  }

  toString() : string {
    return "[CollectionSource]";
  }
}

class Source <sourceElement> implements Pipe<sourceElement>{

  pipe : Pipe<sourceElement>;

  constructor(source : sourceElement[]) {
    // console.log("***Source***: " , source)
    if (Array.isArray(source)) {
      this.pipe = new CollectionSource(source);
      console.log("this.pipe example 1: " , this.pipe)
    } else {
      throw new Error("Source must be an array (for now)");
    }
  }

  connect(step : any , ...args : any[]) {
    this.pipe = new step(this.pipe, ...args);
     console.log("this.pipe example 2: " , this.pipe)
  }

  *process() : Generator<sourceElement> {
    console.log("this.pipe.process() examples: ", this.pipe.process()) 
    yield* this.pipe.process();
  }
}


export default Source;