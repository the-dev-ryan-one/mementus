interface Pipe<T> {
  process(): Generator<T>;
}

class MapStep<InType, OutType> implements Pipe<OutType> {
  pipe: Pipe<InType>;
  transform: (input: InType) => OutType;

  constructor(source: Pipe<InType>, transform: (input: InType) => OutType) {
    this.pipe = source;
    // console.log("-----***-----***----- : " , source)
    this.transform = transform;
    //console.log("-----***-----***----- : " , transform)
  }

  *process(): Generator<OutType> {
    for (const item of this.pipe.process()) {
      //console.log("*********8&&&&*******8&&&****: " , item)
      //console.log("**&&&&&&*******8&&&****: " , this.transform(item) )
      yield this.transform(item);
    }
  }

  toString(): string {
    return "[MapStep]";
  }
}

export default MapStep;
