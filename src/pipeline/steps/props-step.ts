interface Pipe<T> {
  process(): Generator<T>;
}

class PropsStep<T> implements Pipe<T>{

  pipe : Pipe<T>

  constructor(source : Pipe<T>) { 
    this.pipe = source;
    //console.log("*********: " , this.pipe);
  }

  *process() {
    for (const node of this.pipe.process()) {
      yield node.props;
    }
  }

  toString() : string {
    return "[PropsStep]";
  }
}

export default PropsStep;
