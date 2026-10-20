interface Pipe<T> {
  process(): Generator<T>;
}

interface Step<Tin, Tout> {
  pipe: Pipe<Tin>;
  process(): Generator<Tout>;
  toString(): string;
}

interface hasProcess {
  type: "hasProcess";
  process(): Generator<unknown>;
}

export interface isStep {
  pipe: hasProcess;
  process(): Generator<unknown>;
}

//type StepParams<T> = { source: Pipe<T> } | { pipe: Pipe<T> };

type StepConstructor = new (param1: hasProcess | isStep, ...param2: unknown[]) => hasProcess;

// Notes : the correct typing on Pipe in Source is difficult , leave for now

class CollectionSource<T> implements Pipe<T> {
  collection: T[];

  constructor(collection: T[]) {
    // this.collection is an array because  new CollectionSource(source) in Source
    this.collection = collection;
    // console.log("***************** example of this.collection: " , this.collection);
    //console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(this)));
  }

  // the collection source class has a generator method which will yield
  *process(): Generator<T> {
    // console.log("yield delegation: " , this.collection);
    yield* this.collection;
  }

  toString(): string {
    return "[CollectionSource]";
  }
}

// typing pipe.
//

// difficult part of the port , will revisit
class Source {
  // this.pipe can be a collection source or a step , this.pipe.process must be valid , steps dont always
  // return the same type as they recived (sometimes they mutate before passing on) so pipe shouldnt have that constraint
  pipe: hasProcess | isStep;

  constructor(source: unknown[]) {
    if (Array.isArray(source)) {
      this.pipe = new CollectionSource(source);
      //console.log("------------At Source Creation-------->>> ", this.pipe);
      //console.log("$$$$$$$---->>> ", this.pipe.process);
    } else {
      throw new Error("Source must be an array (for now)");
    }
  }

  // connect is called on this.chain
  connect(step: StepConstructor, ...args: unknown[]) {
    //console.log("here x");
    //console.log("------------Before connect-------------->>> ", this.pipe);
    //console.log("$$$$$$$---->>> ", this.pipe.process);

    this.pipe = new step(this.pipe, ...args);
    //console.log("------------After connect--------------->>> ", this.pipe);
    //console.log("$$$$$$$---->>> ", this.pipe.process);
  }

  *process(): Generator<unknown> {
    yield* this.pipe.process();
  }
}

export default Source;
