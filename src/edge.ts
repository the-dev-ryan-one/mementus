import Node from "./node.ts";

// type propValues =  number | string | boolean | string[] | number[];
// type propKVpairs = Record<string , propValues>;

export type propValues = number | string | boolean | string[] | number[];
export type propKVpairs = Record<string, propValues>;

class Edge<edgePropsGeneric extends propKVpairs = propKVpairs> {
  //-----------------------
  // unsure about below
  readonly from: Node;
  readonly to: Node;
  // ----------------------
  readonly id?: number;
  readonly label?: string;
  readonly props: edgePropsGeneric;

  constructor({
    from,
    to,
    id,
    label,
    props,
  }: {
    from: Node | number;
    to: Node | number;
    id?: number;
    label?: string;
    props?: edgePropsGeneric;
  }) {
    this.from = from instanceof Node ? from : new Node({ id: from });
    this.to = to instanceof Node ? to : new Node({ id: to });
    this.id = id;
    this.label = label;
    this.props = props ?? ({} as edgePropsGeneric);

    for (const key of Object.keys(this.props)) {
      Object.defineProperty(this, key, {
        enumerable: true,
        writable: false,
        value: this.props[key],
      });
    }

    Object.preventExtensions(this);
  }
}

export default Edge;
