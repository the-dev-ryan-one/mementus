// these are the allowed types for the prop keys
type propValues =  number | string | boolean | string[] | number[];

// enforces the type/shape of props
type propKVpairs = Record<string , propValues>;

// the generic here will enforce that the props provided to the constructor has the form KV pair where key is a string
class Node <propsGeneric extends propKVpairs> {

  readonly id?: number;
  readonly label? : string;
  readonly props? : propsGeneric;

// syntactically -> constructor({what the constructor takes/params} : {type of params}= {default})
  constructor({ id, label, props } : {id?:number, label?:string,  props?:propsGeneric}= {}) {
    this.id = id;
    this.label = label;
    this.props = props ?? ({} as propsGeneric);

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
