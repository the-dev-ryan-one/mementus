
interface Pipe<T> {
  process(): Generator<T>;
}

type propValues =  number | string | boolean | string[] | number[];

class PropStep<T extends {props:Record<string,propValues>}> implements Pipe<propValues>{

  pipe : Pipe<T>
  match : string

  constructor(source : Pipe<T> , match:string ) {

    this.pipe = source;
    //console.log(" ------------- source ----------- " , source )

    this.match = match;
    //console.log("********************** " , match)

  
  }

  *process() : Generator<propValues> {
    for (const node of this.pipe.process()) {
      // console.log("******************** " , node )
      if (node.props.hasOwnProperty(this.match)) {
        // console.log("******************  " , node.props[this.match])

        const toReturn = node.props[this.match]

        if (toReturn!== undefined) {
          yield toReturn;
        }
      }
    }
  }

  toString() {
    return "[PropStep]";
  }
}

export default PropStep;
