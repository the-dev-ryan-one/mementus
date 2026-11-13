import test from "ava";
import Traversal, { toNumber } from "../../../src/pipeline/traversal.js";
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

test("max(): default key returns the largest value in a stream of numbers", (t) => {
  const traversal = new Traversal([3, 9, 4]);

  t.is(traversal.max(), 9);
});

test("max(): string key reads from props", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: 45 } },
    { id: 3, props: { age: 22 } },
  ]);

  t.is(traversal.max("age"), 45);
});

test("max(): function key is used as-is", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: 45 } },
  ]);

  t.is(
    traversal.max((x) => x.id),
    2,
  );
});

test("max(): handles all-negative values (largest starts undefined, not 0)", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { temp: -10 } },
    { id: 2, props: { temp: -3 } },
    { id: 3, props: { temp: -7 } },
  ]);

  t.is(traversal.max("temp"), -3);
});

test("max(): converts numeric strings via toNumber", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: "35" } },
    { id: 2, props: { age: 9 } },
    { id: 3, props: { age: " 20 " } },
  ]);

  t.is(traversal.max("age"), 35);
});

test("max(): skips items where the key is missing, null or undefined", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2 }, // no props
    { id: 3, props: {} }, // prop missing
    { id: 4, props: { age: null } },
    { id: 5, props: { age: undefined } },
  ]);

  t.is(traversal.max("age"), 30);
});

test("max(): returns undefined for an empty stream or when nothing has the key", (t) => {
  t.is(new Traversal([]).max("age"), undefined);

  const noKey = new Traversal([{ id: 1 }, { id: 2, props: { name: "x" } }]);
  t.is(noKey.max("age"), undefined);
});

test("max(): throws on non-numeric values, naming the offending value", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: "abc" } },
  ]);

  const error = t.throws(() => traversal.max("age"));
  t.regex(error.message, /Cannot aggregate non-numeric value: abc/);
});

test("max(): handles a mix of negative, zero and positive values", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { temp: -5 } },
    { id: 2, props: { temp: 8 } },
    { id: 3, props: { temp: 0 } },
    { id: 4, props: { temp: 2 } },
    { id: 5, props: { temp: -12 } },
  ]);

  t.is(traversal.max("temp"), 8);
});

test("max(): compares numerically across numbers and numeric strings on real nodes", (t) => {
  // as strings, "5.5" would beat "10"
  const traversal = new Traversal(
    [1, 2, 3, 4].map((id) => fanOutEdges.node(id)),
    fanOutEdges,
  );

  t.is(traversal.max("age"), 10);
});

test("min(): finds a numeric-string zero among real nodes", (t) => {
  const traversal = new Traversal(
    [1, 2, 3, 4].map((id) => fanOutEdges.node(id)),
    fanOutEdges,
  );

  t.is(traversal.min("age"), 0);
});

test("min(): default key returns the smallest value in a stream of numbers", (t) => {
  const traversal = new Traversal([3, 9, 4]);

  t.is(traversal.min(), 3);
});

test("min(): string key reads from props", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: 45 } },
    { id: 3, props: { age: 22 } },
  ]);

  t.is(traversal.min("age"), 22);
});

test("min(): function key is used as-is", (t) => {
  const traversal = new Traversal([
    { id: 5, props: { age: 30 } },
    { id: 2, props: { age: 45 } },
    { id: 9, props: { age: 22 } },
  ]);

  t.is(
    traversal.min((x) => x.id),
    2,
  );
});

test("min(): handles all-positive values (smallest starts undefined, not 0)", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { height: 180 } },
    { id: 2, props: { height: 165 } },
    { id: 3, props: { height: 172 } },
  ]);

  t.is(traversal.min("height"), 165);
});

test("min(): handles all-negative values", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { temp: -10 } },
    { id: 2, props: { temp: -3 } },
    { id: 3, props: { temp: -7 } },
  ]);

  t.is(traversal.min("temp"), -10);
});

test("min(): zero is a valid value, not skipped as falsy", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { score: 5 } },
    { id: 2, props: { score: 0 } },
    { id: 3, props: { score: 3 } },
  ]);

  t.is(traversal.min("score"), 0);
});

test("min(): converts numeric strings via toNumber", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: "35" } },
    { id: 2, props: { age: 40 } },
    { id: 3, props: { age: " 20 " } },
  ]);

  t.is(traversal.min("age"), 20);
});

test("min(): compares numerically, not as strings", (t) => {
  // as strings "10" < "9", as numbers 9 < 10
  const traversal = new Traversal([
    { id: 1, props: { n: "10" } },
    { id: 2, props: { n: "9" } },
  ]);

  t.is(traversal.min("n"), 9);
});

test("min(): skips items where the key is missing, null or undefined", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2 }, // no props
    { id: 3, props: {} }, // prop missing
    { id: 4, props: { age: null } },
    { id: 5, props: { age: undefined } },
    { id: 6, props: { age: 41 } },
  ]);

  t.is(traversal.min("age"), 30);
});

test("min(): returns undefined for an empty stream or when nothing has the key", (t) => {
  t.is(new Traversal([]).min("age"), undefined);

  const noKey = new Traversal([{ id: 1 }, { id: 2, props: { name: "x" } }]);
  t.is(noKey.min("age"), undefined);
});

test("min(): throws on non-numeric values, naming the offending value", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: "abc" } },
  ]);

  const error = t.throws(() => traversal.min("age"));
  t.regex(error.message, /Cannot aggregate non-numeric value: abc/);
});

test("min(): resets the traversal so it can be run again, including after a throw", (t) => {
  const ok = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: 22 } },
  ]);
  t.is(ok.min("age"), 22);
  t.is(ok.min("age"), 22); // would be undefined if reset() never ran

  const bad = new Traversal([{ id: 1, props: { age: "abc" } }]);
  t.throws(() => bad.min("age"));
  t.throws(() => bad.min("age")); // would return undefined if the finally block didn't reset
});

test("min(): handles a mix of negative, zero and positive values", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { temp: 5 } },
    { id: 2, props: { temp: -8 } },
    { id: 3, props: { temp: 0 } },
    { id: 4, props: { temp: -2 } },
    { id: 5, props: { temp: 12 } },
  ]);

  t.is(traversal.min("temp"), -8);
});

test("mean(): default key averages a stream of numbers", (t) => {
  const traversal = new Traversal([2, 4, 9]);

  t.is(traversal.mean(), 5);
});

test("mean(): string key reads from props", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 20 } },
    { id: 2, props: { age: 30 } },
    { id: 3, props: { age: 40 } },
  ]);

  t.is(traversal.mean("age"), 30);
});

test("mean(): function key is used as-is", (t) => {
  const traversal = new Traversal([
    { id: 2, props: { age: 99 } },
    { id: 4, props: { age: 99 } },
    { id: 6, props: { age: 99 } },
  ]);

  t.is(
    traversal.mean((x) => x.id),
    4,
  );
});

test("mean(): returns a non-integer result without rounding", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { n: 1 } },
    { id: 2, props: { n: 2 } },
  ]);

  t.is(traversal.mean("n"), 1.5);
});

test("mean(): handles a mix of negative, zero and positive values", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { temp: -5 } },
    { id: 2, props: { temp: 10 } },
    { id: 3, props: { temp: 0 } },
    { id: 4, props: { temp: -1 } },
    { id: 5, props: { temp: 6 } },
  ]);

  t.is(traversal.mean("temp"), 2);
});

test("mean(): zero is a real value and counts toward the average", (t) => {
  // a falsy check on the key would skip the zeros and give 6 instead of 2
  const traversal = new Traversal([
    { id: 1, props: { score: 0 } },
    { id: 2, props: { score: 0 } },
    { id: 3, props: { score: 6 } },
  ]);

  t.is(traversal.mean("score"), 2);
});

test("mean(): converts numeric strings via toNumber", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: "10" } },
    { id: 2, props: { age: 20 } },
    { id: 3, props: { age: " 30 " } },
  ]);

  t.is(traversal.mean("age"), 20);
});

test("mean(): skipped items don't count toward the denominator", (t) => {
  // if the 3 skipped items were counted, this would be 30 / 5 = 6
  const traversal = new Traversal([
    { id: 1, props: { age: 10 } },
    { id: 2 }, // no props
    { id: 3, props: { age: null } },
    { id: 4, props: { age: undefined } },
    { id: 5, props: { age: 20 } },
  ]);

  t.is(traversal.mean("age"), 15);
});

test("mean(): duplicate values are each counted", (t) => {
  // a distinct-values bug would give (2 + 8) / 2 = 5
  const traversal = new Traversal([
    { id: 1, props: { n: 2 } },
    { id: 2, props: { n: 2 } },
    { id: 3, props: { n: 8 } },
  ]);

  t.is(traversal.mean("n"), 4);
});

test("mean(): returns undefined for an empty stream or when nothing has the key", (t) => {
  // not NaN (0 / 0) and not 0
  t.is(new Traversal([]).mean("age"), undefined);

  const noKey = new Traversal([{ id: 1 }, { id: 2, props: { name: "x" } }]);
  t.is(noKey.mean("age"), undefined);
});

test("mean(): throws on non-numeric values, naming the offending value", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: "abc" } },
  ]);

  const error = t.throws(() => traversal.mean("age"));
  t.regex(error.message, /Cannot aggregate non-numeric value: abc/);
});

test("mean(): resets the traversal so it can be run again, including after a throw", (t) => {
  const ok = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: 20 } },
  ]);
  t.is(ok.mean("age"), 25);
  t.is(ok.mean("age"), 25); // would be undefined if reset() never ran

  const bad = new Traversal([{ id: 1, props: { age: "abc" } }]);
  t.throws(() => bad.mean("age"));
  t.throws(() => bad.mean("age")); // would return undefined if the finally block didn't reset
});

test("mean(): averages a prop across real nodes, mixing numbers and numeric strings", (t) => {
  // node 1's children: "5", 5.5, "0" -> (5 + 5.5 + 0) / 3
  const traversal = new Traversal([fanOutEdges.node(1)], fanOutEdges);

  t.is(traversal.out().mean("age"), 3.5);
});

test("mean(): a numeric string of zero counts as a value", (t) => {
  // node 4 has age "0": non-empty so it isn't skipped, and toNumber gives 0
  const traversal = new Traversal([fanOutEdges.node(4)], fanOutEdges);

  t.is(traversal.mean("age"), 0);
});

test("mean(): skips real nodes with no props and doesn't count them in the denominator", (t) => {
  // nodes 5 and 6 have no age; if counted, this would be 10 / 3
  const traversal = new Traversal([fanOutEdges.node(5), fanOutEdges.node(1), fanOutEdges.node(6)], fanOutEdges);

  t.is(traversal.mean("age"), 10);
});

test("mean(): returns undefined when no node in the stream has the prop", (t) => {
  // node 3 points to nodes 5 and 6, neither of which has an age
  const traversal = new Traversal([fanOutEdges.node(3)], fanOutEdges);

  t.is(traversal.out().mean("age"), undefined);
});

test("mean(): default key works on the output of prop()", (t) => {
  const traversal = new Traversal([fanOutEdges.node(1)], fanOutEdges);

  t.is(traversal.out().prop("age").mean(), 3.5);
});

test("mean(): function key works on edges", (t) => {
  // node 1's outgoing edge ids are 10, 20, 30
  const traversal = new Traversal([fanOutEdges.node(1)], fanOutEdges);

  t.is(
    traversal.outE().mean((e) => e.id),
    20,
  );
});

test("mean(): mixing positive and negative values can give a negative mean", (t) => {
  // sum is -12, so a sign or absolute-value bug would give 3 (or 10) instead
  const traversal = new Traversal([
    { id: 1, props: { temp: 10 } },
    { id: 2, props: { temp: -20 } },
    { id: 3, props: { temp: 4 } },
    { id: 4, props: { temp: -6 } },
  ]);

  t.is(traversal.mean("temp"), -3);
});

test("sum(): default key sums a stream of numbers", (t) => {
  t.is(new Traversal([2, 4, 9]).sum(), 15);
});

test("sum(): string key reads from props", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 20 } },
    { id: 2, props: { age: 30 } },
    { id: 3, props: { age: 40 } },
  ]);

  t.is(traversal.sum("age"), 90);
});

test("sum(): function key is used as-is", (t) => {
  const traversal = new Traversal([
    { id: 2, props: { age: 99 } },
    { id: 4, props: { age: 99 } },
  ]);

  t.is(
    traversal.sum((x) => x.id),
    6,
  );
});

test("sum(): handles a mix of positive and negative values", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { n: 10 } },
    { id: 2, props: { n: -20 } },
    { id: 3, props: { n: 4 } },
  ]);

  t.is(traversal.sum("n"), -6);
});

test("sum(): a total of zero returns 0, not undefined", (t) => {
  const cancels = new Traversal([
    { id: 1, props: { n: 5 } },
    { id: 2, props: { n: -5 } },
  ]);
  t.is(cancels.sum("n"), 0);

  t.is(new Traversal([{ id: 1, props: { n: 0 } }]).sum("n"), 0);
});

test("sum(): adds numbers and numeric strings across real nodes", (t) => {
  // node 1's children have ages "5", 5.5 and "0"
  const traversal = new Traversal([fanOutEdges.node(1)], fanOutEdges);

  t.is(traversal.out().sum("age"), 10.5);
});

test("sum(): skips items where the key is missing, null or undefined", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 10 } },
    { id: 2 }, // no props
    { id: 3, props: { age: null } },
    { id: 4, props: { age: undefined } },
    { id: 5, props: { age: 20 } },
  ]);

  t.is(traversal.sum("age"), 30);
});

test("sum(): returns undefined for an empty stream or when nothing has the key", (t) => {
  t.is(new Traversal([]).sum("age"), undefined);

  const noKey = new Traversal([{ id: 1 }, { id: 2, props: { name: "x" } }]);
  t.is(noKey.sum("age"), undefined);
});

test("sum(): throws on non-numeric values, and resets so it can run again", (t) => {
  const traversal = new Traversal([
    { id: 1, props: { age: 30 } },
    { id: 2, props: { age: "abc" } },
  ]);

  const error = t.throws(() => traversal.sum("age"));
  t.regex(error.message, /Cannot aggregate non-numeric value: abc/);

  // would return 30 or undefined if the finally block didn't reset
  t.throws(() => traversal.sum("age"));
});

//-----------------------
// to number tests below
//-----------------------

test("toNumber: returns finite numbers unchanged", (t) => {
  t.is(toNumber(42), 42);
  t.is(toNumber(-3.5), -3.5);
  t.is(toNumber(0), 0);
});

test("toNumber: rejects NaN and ±Infinity numbers", (t) => {
  t.is(toNumber(NaN), undefined);
  t.is(toNumber(Infinity), undefined);
  t.is(toNumber(-Infinity), undefined);
});

test("toNumber: parses numeric strings, including decimals, exponents and whitespace", (t) => {
  t.is(toNumber("35"), 35);
  t.is(toNumber("-2.5"), -2.5);
  t.is(toNumber("1e3"), 1000);
  t.is(toNumber("  7  "), 7);
});

test("toNumber: returns undefined for empty and whitespace-only strings (not 0)", (t) => {
  t.is(toNumber(""), undefined);
  t.is(toNumber("   "), undefined);
  t.is(toNumber("\t\n"), undefined);
});

test("toNumber: returns undefined for non-numeric or non-finite strings", (t) => {
  t.is(toNumber("abc"), undefined);
  t.is(toNumber("12px"), undefined);
  t.is(toNumber("NaN"), undefined);
  t.is(toNumber("Infinity"), undefined);
});

test("toNumber: returns undefined for every other type, even ones Number() would coerce", (t) => {
  t.is(toNumber(null), undefined);
  t.is(toNumber(undefined), undefined);
  t.is(toNumber(true), undefined); // Number(true) === 1
  t.is(toNumber([5]), undefined); // Number([5]) === 5
  t.is(toNumber({}), undefined);
  t.is(toNumber(10n), undefined);
});
