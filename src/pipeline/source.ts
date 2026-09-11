
class CollectionSource <collectionElement> {

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

class Source <sourceElement>{

  pipe : CollectionSource<sourceElement>;

  constructor(source : sourceElement[]) {
    console.log("***Source***: " , source)
    if (Array.isArray(source)) {
      this.pipe = new CollectionSource(source);
      // console.log("example of this.pipe $%$: " , this.pipe)
    } else {
      throw new Error("Source must be an array (for now)");
    }
  }

  connect(step, ...args) {
    this.pipe = new step(this.pipe, ...args);
  }

  *process() {
    yield* this.pipe.process();
  }
}


export default Source;