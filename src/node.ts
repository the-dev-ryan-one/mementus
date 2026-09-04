// these are the allowed types for the prop keys
// type propValues =  number | boolean | string[] | number[];
type propValues =  boolean;

// enforces the type/shape of props
type propKVpairs = Record<string , propValues>;

class Node {

  readonly id?: number;
  readonly label? : string;
  readonly props? : propKVpairs;

// syntactically -> constructor({what the constructor takes/params} : {type of params}= {default})
  constructor({ id, label, props } : {id?:number, label?:string,  props?:propKVpairs}= {}) {
    this.id = id;
    this.label = label;
    this.props = props || {};

    for (let key of Object.keys(this.props)) {
      Object.defineProperty(this, key, {
        enumerable: true,
        writable: false,
        value: this.props[key]
      });
    }

    Object.preventExtensions(this);
  }
}

export default Node;

// class Node {

//   nodePropVals : number | string | boolean;
//   nodeProps : Record< string ,  >

//   type nodeP

//   constructor({ id, label, props } = {}) {
//     this.id = id;
//     this.label = label;
//     this.props = props || {};

//     for (let key of Object.keys(this.props)) {
//       Object.defineProperty(this, key, {
//         enumerable: true,
//         writable: false,
//         value: props[key]
//       });
//     }

//     Object.preventExtensions(this);
//   }
// }

// export default Node;
