import Node from "./node.ts";

type propValues =  number | string | boolean | string[] | number[];

// enforces the type/shape of props
type propKVpairs = Record<string , propValues>;

class Edge <edgePropsGeneric extends propKVpairs>{

  //-----------------------
  // unsure about below
  readonly from: Node<propKVpairs> | number;
  readonly to: Node<propKVpairs> | number;
  // ----------------------
  readonly id?: number;
  readonly label?: string;
  readonly props?: edgePropsGeneric;
  
  constructor({from, to, id, label, props} : {from:Node<propKVpairs>|number, to:Node<propKVpairs>|number, id?:number, label?:string, props?:edgePropsGeneric}) {
    this.from = (from instanceof Node) ? from : new Node({ id: from });
    this.to = (to instanceof Node) ? to : new Node({ id: to });

    this.id = id; // number
    this.label = label; // string
    this.props = props ?? ({} as edgePropsGeneric);

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

export default Edge;
