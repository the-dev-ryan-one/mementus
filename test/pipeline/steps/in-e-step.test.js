import test from "ava";
import Source from "../../../src/pipeline/source.js";
import InEStep from "../../../src/pipeline/steps/in-e-step.js";
import { fanOutEdges, labeledFanOutEdges } from "../graph-sample.js";

test("Enumerates incoming edges as a flat map", (t) => {
  const source = new Source([fanOutEdges.node(5)], fanOutEdges);
  const inEStep = new InEStep(source, fanOutEdges);

  const producer = inEStep.process();

  t.is(producer.next().value.id, 40);
  t.is(producer.next().value.id, 50);
});

// helper: run an InEStep over the given node ids and return the edge ids in order.
// label defaults to null to match what Traversal.inE() passes to the step.
const inEIds = (graph, nodeIds, label = null) => {
  const source = new Source(nodeIds.map((id) => graph.node(id)));
  const step = new InEStep(source, graph, label);

  return [...step.process()].map((edge) => edge.id);
};

test("Yields exactly the incoming edges, no more and no fewer", (t) => {
  t.deepEqual(inEIds(fanOutEdges, [5]), [40, 50]);
});

test("Enumerates incoming edges for several input nodes in order", (t) => {
  // input order (6, then 5) differs from id order, so this proves order follows the input
  t.deepEqual(inEIds(fanOutEdges, [6, 5]), [60, 40, 50]);
});

test("Yields nothing for a node with no incoming edges", (t) => {
  t.deepEqual(inEIds(fanOutEdges, [1]), []);
});

test("Yields nothing for an empty source", (t) => {
  t.deepEqual(inEIds(fanOutEdges, []), []);
});

test("Returns done once all edges are consumed", (t) => {
  const source = new Source([fanOutEdges.node(5)]);
  const producer = new InEStep(source, fanOutEdges).process();

  producer.next();
  producer.next();
  t.true(producer.next().done);
});

test("A null label matches every incoming edge", (t) => {
  t.deepEqual(inEIds(labeledFanOutEdges, [5], null), [40, 50, 70]);
});

test("An omitted label matches every incoming edge", (t) => {
  const source = new Source([labeledFanOutEdges.node(5)]);
  const step = new InEStep(source, labeledFanOutEdges);

  t.deepEqual(
    [...step.process()].map((e) => e.id),
    [40, 50, 70],
  );
});

test("Only matches incoming edges with the given label", (t) => {
  // node 5 has three incoming edges, only 70 is label1
  t.deepEqual(inEIds(labeledFanOutEdges, [5], "label1"), [70]);
  t.deepEqual(inEIds(labeledFanOutEdges, [5], "label4"), [40]);
});

test("Label filtering applies across several input nodes", (t) => {
  // label2: 20 goes into node 3, 80 goes into node 6
  t.deepEqual(inEIds(labeledFanOutEdges, [3, 5, 6], "label2"), [20, 80]);
});

test("Unlabelled edges are not matched by a label", (t) => {
  t.deepEqual(inEIds(fanOutEdges, [5], "label1"), []);
});

test("A label that matches nothing yields nothing", (t) => {
  t.deepEqual(inEIds(labeledFanOutEdges, [5], "no-such-label"), []);
});

test("Creates an isolated iteration context with each process", (t) => {
  const source = new Source([fanOutEdges.node(5)]);
  const step = new InEStep(source, fanOutEdges);

  t.deepEqual(
    [...step.process()].map((e) => e.id),
    [40, 50],
  );
  t.deepEqual(
    [...step.process()].map((e) => e.id),
    [40, 50],
  );
});
