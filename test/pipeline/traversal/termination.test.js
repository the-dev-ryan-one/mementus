import test from "ava";
import Traversal from "../../../src/pipeline/traversal.js";
import { fanOutEdges, labeledFanOutEdges } from "../graph-sample.js";

test("Terminate with empty source", (t) => {
  const traversal = new Traversal([]);

  t.deepEqual(traversal.all(), []);
});

test("Terminate with all values", (t) => {
  const traversal = new Traversal([1, 2, 3, 4]);

  t.deepEqual(traversal.all(), [1, 2, 3, 4]);
});

test("Terminate with one value", (t) => {
  const traversal = new Traversal([1, 2, 3, 4]);

  t.deepEqual(traversal.one(), 1);
});

test("Terminate by taking a given number of values", (t) => {
  const traversal = new Traversal([1, 2, 3, 4, 5, 6, 7, 8]);

  t.deepEqual(traversal.take(4), [1, 2, 3, 4]);
});

test("Run the pipeline returning an iterator that can produce values", (t) => {
  const traversal = new Traversal([1, 2, 3, 4]);

  const producer = traversal.run();

  t.is(producer.next().value, 1);
  t.is(producer.next().value, 2);
  t.is(producer.next().value, 3);
  t.is(producer.next().value, 4);
  t.true(producer.next().done);
});

// -------------------------------------------------------------
// -------------------------------------------------------------

test("Counts every node when no ids are given", (t) => {
  t.is(fanOutEdges.n().count(), 6);
});

test("Counts the results of a single step", (t) => {
  t.is(fanOutEdges.n(1).out().count(), 3);
  t.is(fanOutEdges.n(1).outE().count(), 3);
  t.is(fanOutEdges.n(5).inE().count(), 2);
});

test("Returns 0 when there are no results", (t) => {
  t.is(fanOutEdges.n(1).in().count(), 0);
  t.is(fanOutEdges.n(1).inE().count(), 0);
});

test("Counts duplicates instead of collapsing them", (t) => {
  // 1 -> 2, 3, 4, then 2 -> 5, 3 -> 5, 3 -> 6, so node 5 appears twice.
  // A Set-based count would return 2 here.
  t.is(fanOutEdges.n(1).out().out().count(), 3);
});

test("Matches the length of all()", (t) => {
  t.is(fanOutEdges.n(1).out().out().count(), fanOutEdges.n(1).out().out().all().length);
});

test("Respects a label filter", (t) => {
  // from node 1: label1 -> 2 (edge 10) and 5 (edge 70)
  t.is(labeledFanOutEdges.n(1).out("label1").count(), 2);
  t.is(labeledFanOutEdges.n(1).out("no-such-label").count(), 0);
});

test("Counts after where and filter steps", (t) => {
  t.is(
    fanOutEdges
      .n()
      .filter((node) => node.id >= 2)
      .count(),
    5,
  );
});

test("Resets the traversal so the next query starts fresh", (t) => {
  const traversal = fanOutEdges.n(1);

  t.is(traversal.out().count(), 3);
  // without a reset, the old out() step would still be connected and this would give [2, 3, 4]
  t.deepEqual(traversal.id().all(), [1]);
});
