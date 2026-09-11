
// IdStep takes a new instance of the source class
// new IdStep(new Source([{id: 123}, {id: 987}]));

interface Pipe<SourceElement> {
  process(): Generator<SourceElement>;
}

class IdStep<SourceElement extends {id : number}> implements Pipe<number>{

  pipe : Pipe<SourceElement>;

  constructor(source : Pipe<SourceElement>) {
    this.pipe = source;
  }

  *process() : Generator<number> {
    for (const item of this.pipe.process()) {
      yield item.id;
    }
  }

  toString() : string {
    return "[IdStep]";
  }
}

export default IdStep;