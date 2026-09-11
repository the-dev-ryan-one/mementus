


class PropsStep {
  constructor(source) {
    this.pipe = source;
  }

  *process() {
    for (const node of this.pipe.process()) {
      // console.log("here $")
      yield node.props;
    }
  }

  toString() {
    return "[PropsStep]";
  }
}

export default PropsStep;
