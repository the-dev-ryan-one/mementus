interface Pipe<T> {
  process(): Generator<T>;
}

// this may be necessary class LabelStep<T extends {label?: string}> implements Pipe<string | undefined>
// will revisit
class LabelStep<T extends { label: string }> implements Pipe<string> {
  pipe: Pipe<T>;

  constructor(source: Pipe<T>) {
    this.pipe = source;
    //console.log("------> this.pipe ---> " , this.pipe)
  }

  *process(): Generator<string> {
    for (const element of this.pipe.process()) {
      //console.log("------> element.label ---> " , element.label )
      yield element.label;
    }
  }

  toString(): string {
    return "[LabelStep]";
  }
}

export default LabelStep;
