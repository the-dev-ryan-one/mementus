import test from "ava";
import Source from "../../../src/pipeline/source.js";
import PropsStep from "../../../src/pipeline/steps/props-step.js";

test("Deferences props from input pipe", t => {
  const props = new PropsStep(new Source([
    {id: 123, props: { color: "red" }},
    {id: 987, props: { color: "green"}},
    {id: 456, props: { color: "blue"}}
  ]));

  // const newSource = new Source([
  //   {id: 123, props: { color: "red" }},
  //   {id: 987, props: { color: "green"}},
  //   {id: 456, props: { color: "blue"}}
  // ])

  // console.log("newSource: " , newSource)
  // console.log("props: " , props);

  t.deepEqual([...props.process()], [{ color: "red" }, { color: "green"}, { color: "blue"}]);
});
