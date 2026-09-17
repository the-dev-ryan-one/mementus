
// IdStep takes a new instance of the source class
// new IdStep(new Source([{id: 123}, {id: 987}]));

interface Pipe<T1> {
  process(): Generator<T1>;
}

class IdStep<T2 extends {id : number}> implements Pipe<number>{

  pipe : Pipe<T2>;

  constructor(source : Pipe<T2>) {
    // console.log("source:" , source)
    this.pipe = source;
  }

  *process() : Generator<number> {
    // console.log("this.pipe.process(): " , this.pipe.process() )
    for (const item of this.pipe.process()) {
      yield item.id;
    }
  }

  toString() : string {
    return "[IdStep]";
  }
}

export default IdStep;