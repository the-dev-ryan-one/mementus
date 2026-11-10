import test from "ava";
import Source from "../../../src/pipeline/source.js";
import OutEStep from "../../../src/pipeline/steps/out-e-step.js";
import { fanOutEdges, labeledFanOutEdges } from "../graph-sample.js";

test("Enumerates outgoing edges as a flat map", (t) => {
  const source = new Source([fanOutEdges.node(1)], fanOutEdges);
  const outEStep = new OutEStep(source, fanOutEdges);

  const producer = outEStep.process();

  t.is(producer.next().value.id, 10);
  t.is(producer.next().value.id, 20);
  t.is(producer.next().value.id, 30);
});

//------------------------------
// new tests below
//------------------------------
// ids of the outgoing edges of a node in the labelled graph, optionally filtered by label
const outEIds = (nodeId, label) => {
  const source = new Source([labeledFanOutEdges.node(nodeId)], labeledFanOutEdges);
  const step = label === undefined ? new OutEStep(source, labeledFanOutEdges) : new OutEStep(source, labeledFanOutEdges, label);
  return [...step.process()].map((edge) => edge.id);
};

test("Without a label, enumerates all outgoing edges", (t) => {
  t.deepEqual(outEIds(1), [10, 20, 30, 70, 80]);
});

test("With null as the label, enumerates all outgoing edges", (t) => {
  t.deepEqual(outEIds(1, null), [10, 20, 30, 70, 80]);
});

test("With a label, enumerates only outgoing edges with that label", (t) => {
  t.deepEqual(outEIds(1, "label3"), [30]);
  t.deepEqual(outEIds(2, "label4"), [40]);
});

test("With a label, enumerates every matching edge, not just the first", (t) => {
  t.deepEqual(outEIds(1, "label1"), [10, 70]);
  t.deepEqual(outEIds(1, "label2"), [20, 80]);
});

test("With a label, yields nothing when the node has no outgoing edge with it", (t) => {
  t.deepEqual(outEIds(2, "label1"), []);
  t.deepEqual(outEIds(1, "label4"), []);
});

test("With a label no edge has, yields nothing", (t) => {
  t.deepEqual(outEIds(1, "nope"), []);
});

test("With a label, yields nothing for a node with no outgoing edges", (t) => {
  t.deepEqual(outEIds(5, "label4"), []);
});

test("Unlabelled edges are not matched by a label", (t) => {
  const source = new Source([fanOutEdges.node(1)], fanOutEdges);
  const outEStep = new OutEStep(source, fanOutEdges, "label1");

  t.deepEqual([...outEStep.process()], []);
});

test("Enumerates outgoing edges for several input nodes in order", (t) => {
  const source = new Source([labeledFanOutEdges.node(2), labeledFanOutEdges.node(3)], labeledFanOutEdges);
  const outEStep = new OutEStep(source, labeledFanOutEdges);

  t.deepEqual(
    [...outEStep.process()].map((edge) => edge.id),
    [40, 50, 60],
  );
});
