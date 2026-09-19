interface Pipe<T> {
  process(): Generator<T>;
}

interface HasProps<P> {
  props : P
}

class PropsStep<T extends HasProps<P> , P = Record<string , unknown>> implements Pipe<P>{

  pipe : Pipe<T>

  constructor(source : Pipe<T>) { 
    this.pipe = source;
    //console.log("*********: " , this.pipe);
  }

  *process() : Generator<P> {
    for (const node of this.pipe.process()) {
      //console.log("---------> node.props --- " , node.props)
      yield node.props;
    }
  }

  toString() : string {
    return "[PropsStep]";
  }
}

export default PropsStep;
