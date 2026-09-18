
// IdStep takes a new instance of the source class
// new IdStep(new Source([{id: 123}, {id: 987}]));

interface Pipe<T> {
  process(): Generator<T>;
}

// T must extend {id:number} because item.id must work for every item from this.pipe.process()
class IdStep<T extends {id : number}> implements Pipe<number>{

  pipe : Pipe<T>;

  constructor(source : Pipe<T>) {
    // console.log("------$$$$--------->  ---- source ----- " , source)
    // console.log("&&&&& ---> " , source.process().next())
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