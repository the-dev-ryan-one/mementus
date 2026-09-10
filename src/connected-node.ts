import Node from "./node.ts";

type propValues =  number | string | boolean | string[] | number[];
type propKVpairs = Record<string , propValues>;

class ConnectedNode <propGeneric extends propKVpairs>{

  readonly graph: any;

  readonly id?: number;
  readonly label? : string;
  readonly props?: propGeneric;

  constructor(node: Node<propGeneric>, graph: any) {
    this.id = node.id;
    this.label = node.label;
    this.props = node.props ?? ({} as propGeneric);
    this.graph = graph;

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

export default ConnectedNode;
