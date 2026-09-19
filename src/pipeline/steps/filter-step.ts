
interface Pipe<T> {
  process(): Generator<T>;
}

class FilterStep<T> {

  pipe : Pipe<T>
  predicate : (input:T) => boolean

  constructor(source : Pipe<T>, predicate : (input:T) => boolean ) {

    this.pipe = source;
    // console.log("---RRR----------RRRR------RRR-------RRR-- " ,  source )
    this.predicate = predicate;
    // console.log("---RRR----------RRRR------RRR-------RRR-- " ,  predicate )

  }

  *process() : Generator<T> {

    for (const item of this.pipe.process()) {
      // console.log("---RRR----------RRRR------RRR-------RRR-- " ,  this.predicate(item) )
      if (this.predicate(item)) yield item;

    }
  }

  toString() : string {
    return "[FilterStep]";
  }
}

export default FilterStep;
