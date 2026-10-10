import Node from "./node.ts";

// type propValues =  number | string | boolean | string[] | number[];
// type propKVpairs = Record<string , propValues>;

//----------------------------------
// Rationale for port of Edge
//
// from and to are required , they appear in every call to new Edge() (prove
// to youself with rg -U -A5 "new Edge") and addEdge() creates new
// to and from nodes if they're not supplied . To and From are of type Node.
//
// remember edge.props.title vs edge.title
//
//
// should i reject an edge whose node is undefined ? Probably not
// because isValidEdge in setEdge should stop junk from being put in
// the incidence list and many tests create Edges without ids
//----------------------------------

export type propValues = number | string | boolean | string[] | number[];
export type propKVpairs = Record<string, propValues>;

const reservedPropKeys = new Set(["to", "from", "id", "label", "props"]);

class Edge<edgePropsGeneric extends propKVpairs = propKVpairs> {
  readonly from: Node;
  readonly to: Node;

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
      // prevent Edge feilds being corrupted by bad choice of prop key
      if (reservedPropKeys.has(key))
        throw new Error(
          `Edge: prop key: ${key} is invalid , key cannot be one of : ${[...reservedPropKeys].join(",")}`,
        );
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
