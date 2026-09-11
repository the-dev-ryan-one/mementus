// interface Pipe<T> {
//   process() : Generator<T>;
// }

class PropsStep {

  constructor(source) { 
    this.pipe = source;
    console.log("*********: " , this.pipe);
  }

  *process() {
    for (const node of this.pipe.process()) {
      // console.log("**node.props**: " , node.props)
      yield node.props;
    }
  }

  toString() : string {
    return "[PropsStep]";
  }
}

export default PropsStep;
