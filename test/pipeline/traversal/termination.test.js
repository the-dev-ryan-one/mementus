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

//-----------------------------
// count distinct tests below
//-----------------------------

test("Counts each node once when no key is given", (t) => {
  // 1 -> 2, 3, 4, then 2 -> 5, 3 -> 5, 3 -> 6, so node 5 is reached twice
  const traversal = () => fanOutEdges.n(1).out().out();

  t.is(traversal().count(), 3);
  t.is(traversal().countDistinct(), 2);
});

test("Counts distinct plain values", (t) => {
  // ids are [5, 5, 6]
  t.is(fanOutEdges.n(1).out().out().id().countDistinct(), 2);
});

test("A key function decides what counts as the same", (t) => {
  t.is(
    fanOutEdges
      .n(1)
      .out()
      .out()
      .countDistinct((n) => n.id),
    2,
  );
  t.is(
    fanOutEdges.n().countDistinct((n) => n.id),
    6,
  );
});

test("A constant key collapses everything to one", (t) => {
  t.is(
    fanOutEdges.n().countDistinct(() => "same"),
    1,
  );
});

test("Dedupes edges by id with a key function", (t) => {
  // n(1).out().out() reaches nodes [5, 5, 6], so inE() yields [40, 50, 40, 50, 60]
  const traversal = () => fanOutEdges.n(1).out().out().inE();

  t.is(traversal().count(), 5);
  t.is(
    traversal().countDistinct((e) => e.id),
    3,
  );
});

test("Counts distinct labels", (t) => {
  // node 1's outgoing edges are 10, 20, 30, 70, 80 with labels
  // label1, label2, label3, label1, label2
  const traversal = () => labeledFanOutEdges.n(1).outE();

  t.is(traversal().count(), 5);
  t.is(
    traversal().countDistinct((e) => e.label),
    3,
  );
});

test("Items with a missing key are not counted", (t) => {
  // only nodes 2, 3 and 4 have a color. Nodes 1, 5 and 6 key to undefined and are skipped
  t.is(
    fanOutEdges.n().countDistinct((n) => n.props?.color),
    3,
  );
});

test("Returns 0 when there are no results (countDistinct)", (t) => {
  t.is(fanOutEdges.n(1).in().countDistinct(), 0);
  t.is(
    fanOutEdges
      .n(1)
      .in()
      .countDistinct((n) => n.id),
    0,
  );
});

test("Never exceeds count()", (t) => {
  const traversal = () => fanOutEdges.n(1).out().out();

  t.true(traversal().countDistinct() <= traversal().count());
});

test("Calls the key function once per result", (t) => {
  const seen = [];
  fanOutEdges
    .n(1)
    .out()
    .out()
    .countDistinct((n) => {
      seen.push(n.id);
      return n.id;
    });

  t.deepEqual(seen, [5, 5, 6]);
});

test("Resets the traversal so the next query starts fresh (countDistinct)", (t) => {
  const traversal = fanOutEdges.n(1);

  t.is(traversal.out().countDistinct(), 3);
  // without a reset, the old out() step would still be connected
  t.deepEqual(traversal.id().all(), [1]);
});

test("Edges without a key function (depends on Graph returning the same instance)", (t) => {
  // passes only if Graph hands back the same Edge object for the same id.
  // If this returns 5, edges are rebuilt on each lookup and you need the key form above.
  t.is(fanOutEdges.n(1).out().out().inE().countDistinct(), 3);
});

test("e(): counts every edge once", (t) => {
  t.is(fanOutEdges.e().count(), 6);
  t.is(fanOutEdges.e().countDistinct(), 6);
});

test("e(): distinct by id matches the number of edges", (t) => {
  t.is(
    fanOutEdges.e().countDistinct((e) => e.id),
    6,
  );
  t.is(
    labeledFanOutEdges.e().countDistinct((e) => e.id),
    8,
  );
});

test("e(): a single edge counts as one", (t) => {
  t.is(fanOutEdges.e(10).countDistinct(), 1);
  t.is(
    fanOutEdges.e(10).countDistinct((e) => e.id),
    1,
  );
});

test("e(): collapses edges that share a label", (t) => {
  // labeled graph: 8 edges, but label1 is on 10 and 70, label2 on 20 and 80
  const traversal = () => labeledFanOutEdges.e();

  t.is(traversal().count(), 8);
  t.is(
    traversal().countDistinct((e) => e.label),
    6,
  );
});

test("e(): counts distinct plain values after label()", (t) => {
  t.is(labeledFanOutEdges.e().label().count(), 8);
  t.is(labeledFanOutEdges.e().label().countDistinct(), 6);
});

test("e(): counts distinct plain values after id()", (t) => {
  t.is(fanOutEdges.e().id().countDistinct(), 6);
});

test("e(): unlabelled edges are not counted by a label key", (t) => {
  // assumes an edge created without a label has label undefined or null
  t.is(
    fanOutEdges.e().countDistinct((e) => e.label),
    0,
  );
});

test("e(): a constant key collapses everything to one", (t) => {
  t.is(
    fanOutEdges.e().countDistinct(() => "same"),
    1,
  );
});

test("e(): counts after a filter step", (t) => {
  // label1 is on edges 10 and 70, label2 on 20 and 80
  const traversal = () => labeledFanOutEdges.e().filter((e) => e.label === "label1" || e.label === "label2");

  t.is(traversal().count(), 4);
  t.is(
    traversal().countDistinct((e) => e.label),
    2,
  );
});

test("e(): never exceeds count()", (t) => {
  const traversal = () => labeledFanOutEdges.e();

  t.true(traversal().countDistinct((e) => e.label) <= traversal().count());
});

test("e(): a missing edge id yields 0 with the default key", (t) => {
  // documents current behaviour: e(999) wraps undefined in an array, and
  // countDistinct skips undefined keys. count() would return 1 here.
  t.is(fanOutEdges.e(999).countDistinct(), 0);
});

test("e(): resets the traversal so the next query starts fresh", (t) => {
  const traversal = fanOutEdges.e();

  t.is(traversal.countDistinct(), 6);
  // without a reset, the old steps would still be connected
  t.deepEqual(
    traversal
      .id()
      .all()
      .sort((a, b) => a - b),
    [10, 20, 30, 40, 50, 60],
  );
});

//------------------------
//------------------------
const age = (n) => n.props?.age;
const sorted = (xs) => [...xs].sort((a, b) => a - b);

test("max(): finds the max across mixed number and string values", (t) => {
  // 10, "5", 5.5, "0", then two nodes with no age
  t.is(fanOutEdges.n().max(age), 10);
});

test("max(): converts a numeric string to a number", (t) => {
  // t.is is strict, so this fails if "5" comes back as a string
  t.is(fanOutEdges.n(2).max(age), 5);
});

test("max(): a string zero is a valid value, not a missing one", (t) => {
  t.is(fanOutEdges.n(4).max(age), 0);
});

test("max(): keeps decimals", (t) => {
  t.is(fanOutEdges.n(3).max(age), 5.5);
});

test("max(): compares as numbers, not as strings", (t) => {
  // as strings "5" > "10", so a lexicographic comparison would return 5
  t.is(
    fanOutEdges
      .n()
      .filter((n) => n.id <= 2)
      .max(age),
    10,
  );
});

test("max(): returns undefined when no item has the value", (t) => {
  t.is(fanOutEdges.n(5).max(age), undefined);
});

test("max(): returns undefined for an empty traversal", (t) => {
  // node 1 has no incoming edges
  t.is(fanOutEdges.n(1).in().max(age), undefined);
});

test("max(): skips undefined keys instead of failing", (t) => {
  // nodes 3, 4, 5 and 6: 5.5, "0", and two with no age
  t.is(
    fanOutEdges
      .n()
      .filter((n) => n.id >= 3)
      .max(age),
    5.5,
  );
});

test("max(): skips null keys", (t) => {
  t.is(
    fanOutEdges.n().max((n) => (n.id > 3 ? null : n.id)),
    3,
  );
});

test("max(): handles all-negative values", (t) => {
  // catches a result that starts from 0 instead of from the first value
  t.is(
    fanOutEdges.n().max((n) => -n.id),
    -1,
  );
});

test("max(): uses the item itself when no key is given", (t) => {
  t.is(fanOutEdges.n().id().max(), 6);
});

test("max(): works after traversal steps", (t) => {
  // out() from node 1 reaches nodes 2, 3 and 4: "5", 5.5 and "0"
  t.is(fanOutEdges.n(1).out().max(age), 5.5);
});

test("max(): respects a label filter", (t) => {
  // label1 from node 1 reaches node 2 ("5") and node 5 (no age)
  t.is(labeledFanOutEdges.n(1).out("label1").max(age), 5);
});

test("max(): works on edges", (t) => {
  t.is(
    fanOutEdges.e().max((e) => e.id),
    60,
  );
  t.is(
    labeledFanOutEdges.e().max((e) => e.id),
    80,
  );
});

test("max(): throws on a non-numeric value", (t) => {
  const error = t.throws(() => fanOutEdges.n().max((n) => n.props?.color));

  t.regex(error.message, /non-numeric/);
  // the message names the offending value
  t.regex(error.message, /red/);
});

test("max(): throws when the default key meets node objects", (t) => {
  t.throws(() => fanOutEdges.n().max(), { message: /non-numeric/ });
});

test("max(): rejects NaN and Infinity", (t) => {
  t.throws(() => fanOutEdges.n().max(() => NaN));
  t.throws(() => fanOutEdges.n().max(() => Infinity));
});

test("max(): resets the traversal after a successful run", (t) => {
  const traversal = fanOutEdges.n();

  t.is(traversal.max(age), 10);
  // without a reset, the old steps would still be connected
  t.deepEqual(sorted(traversal.id().all()), [1, 2, 3, 4, 5, 6]);
});

test("max(): resets the traversal even when it throws", (t) => {
  const traversal = fanOutEdges.n();

  t.throws(() => traversal.max((n) => n.props?.color));
  // this is the try/finally case
  t.deepEqual(sorted(traversal.id().all()), [1, 2, 3, 4, 5, 6]);
});
