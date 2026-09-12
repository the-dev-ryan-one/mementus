# TypeScript fluency exercises — building toward your pipeline port

Each part isolates one concept before combining them. Do them **in order** — later
exercises assume you're comfortable with earlier ones. Try each one yourself first
(use `npx tsx filename.ts` to run), then check the solution at the bottom.

Don't rush Part 1 and Part 2 — generators and structural typing are the two ideas
that caused the most friction in your actual port, so it's worth over-practicing
them here where the stakes are zero.

---

## Part 1 — Generators

### 1.1 — Write your first generator
Write a generator function `countTo(n: number)` that yields `1, 2, 3, ..., n`.
Call it and print each value with a `for...of` loop.

### 1.2 — Prove it's lazy
Write a generator `logAndYield()` that `console.log`s a message immediately
before each `yield`. Call the function (don't iterate yet) and log something
right after. Confirm nothing from inside the generator has printed yet.
Then call `.next()` twice and watch the order things print in.

### 1.3 — `yield` vs `yield*`
Write two generators:
- `wrapWhole(arr: number[])` — yields the *entire array* as one value (plain `yield`)
- `wrapEach(arr: number[])` — yields each *element* of the array separately (`yield*`)

Call `[...wrapWhole([1,2,3])]` and `[...wrapEach([1,2,3])]` and compare the results.
Write down, in your own words, what the difference tells you.

### 1.4 — Generator as a class method
Write a class `Countdown` with a constructor taking a `start: number`, and a
generator method `*process()` that yields from `start` down to `1`.

### 1.5 — Chaining two generators
Write a generator `doubleEach(source: Generator<number>)` that takes another
generator as input, pulls each value out with `for...of`, and yields it doubled.
Feed it the output of your `countTo` generator from 1.1 and print the result.
(This is the exact "pull from an upstream generator" pattern every Step in your
codebase uses.)

---

## Part 2 — Interfaces and structural typing

### 2.1 — Minimal interface
Write an interface `HasName` with one property: `name: string`. Write two
**unrelated** classes — `Dog` and `Company` — that both happen to have a `name`
field (plus other unrelated fields of your choosing). Write a function
`greet(x: HasName)` that logs `Hello, ${x.name}`. Call it with an instance of
each class. Notice neither class ever wrote `implements HasName`.

### 2.2 — Method-shaped interface
Write an interface `Soundmaker` with one method: `makeSound(): string`. Write
three unrelated classes (`Dog`, `Car`, `Alarm`) each implementing `makeSound()`
differently. Write a function `playSound(s: Soundmaker)` that calls and logs
`s.makeSound()`. Call it with all three. This is the same shape as your `Pipe<T>`
interface — one method, many unrelated implementers.

### 2.3 — Break it on purpose
Take `HasName` from 2.1. Write a third class, `Robot`, with a field called
`label` instead of `name`. Try passing a `Robot` instance to `greet()`.
Read the compiler error carefully — this is the exact category of error you'll
get if you type `pipe` as the wrong shape.

### 2.4 — Field vs method (the bug you hit twice)
Write an interface `Counter` **incorrectly**, as a field:
```typescript
interface Counter {
  getValue: number;
}
```
Try to implement it with a class that has a real method `getValue(): number { return 5; }`.
Watch it fail to satisfy the interface. Now fix the interface to
`getValue(): number;` and watch it pass. Write one sentence explaining why the
first version was wrong.

---

## Part 3 — Generics

### 3.1 — Generic identity function
Write a function `identity<T>(x: T): T` that just returns its input unchanged.
Call it with a number, a string, and an object literal. Hover over (or log
`typeof`) the result each time and confirm TypeScript infers the specific type
each time, rather than collapsing everything to one type.

### 3.2 — Generic class, one type parameter
Write a class `Box<T>` with a constructor taking a `value: T`, and a method
`get(): T` returning it. Create a `Box<number>` and a `Box<string>`. Confirm
`.get()` returns the correctly narrowed type each time, without you specifying
`T` anywhere except at construction.

### 3.3 — Generic class wrapping an array (this is `CollectionSource`)
Write a class `Wrapper<T>` with:
- a field `items: T[]`
- a constructor taking `items: T[]`
- a generator method `*process(): Generator<T>` that yields each item

Test it with `new Wrapper([1,2,3])` and `new Wrapper(["a","b"])`.

### 3.4 — Generic constraint (`extends`)
Write a generic function `getId<T extends { id: number }>(x: T): number` that
returns `x.id`. Call it with an object that has an `id: number` field — should
work. Call it with an object that has no `id` field at all — should fail to
compile. Read the exact error TypeScript gives you.

### 3.5 — Two type parameters (input vs output)
Write a class `Transformer<TIn, TOut>` with:
- a constructor taking a `transform: (x: TIn) => TOut`
- a method `run(x: TIn): TOut` that applies the transform

Create a `Transformer<number, string>` that converts numbers to strings, and a
`Transformer<string, number>` that returns string length. This is the same
input/output split you needed for `IdStep` — one param for what comes in,
a separate one for what comes out.

---

## Part 4 — Function types and constructor types

### 4.1 — Type a callback parameter
Write a function `applyTwice(x: number, fn: (n: number) => number): number`
that calls `fn` on `x` twice in a row (`fn(fn(x))`). Call it with an arrow
function that adds 1.

### 4.2 — Store a function as a typed field
Write a class `Calculator` with a field `operation: (a: number, b: number) => number`,
set via the constructor. Add a method `compute(a: number, b: number)` that calls
`this.operation(a, b)`. Instantiate it once with addition, once with multiplication.

### 4.3 — A constructor type
Write a type alias for "a constructor that takes a `string` and produces
something with a `.describe(): string` method":
```typescript
interface Describable { describe(): string; }
type DescribableConstructor = new (input: string) => Describable;
```
Write two unrelated classes satisfying `Describable`. Write a function
`build(Ctor: DescribableConstructor, input: string): Describable` that does
`return new Ctor(input)`. Call it with each class. This is the exact shape
`StepConstructor` uses in your `connect()` method.

---

## Part 5 — Capstone: build a mini pipeline from scratch

Don't look at your real codebase for this one — build a **smaller, original**
version using everything above, then compare your instincts against how the
real one is typed.

1. Write `interface Pipe<T> { process(): Generator<T>; }`.
2. Write `class ArraySource<T> implements Pipe<T>` wrapping a `T[]` (like 3.3).
3. Write `class DoubleStep implements Pipe<number>` that takes a `Pipe<number>`
   as input and yields each value doubled.
4. Write `class ToStringStep<T> implements Pipe<string>` that takes a `Pipe<T>`
   and yields `String(item)` for each item.
5. Chain them by hand: `new ToStringStep(new DoubleStep(new ArraySource([1,2,3])))`,
   then call `.process()` and print `[...result]`.
6. Optional stretch: write a generic `connect()`-style helper function that takes
   a `Pipe<T>` and a Step *constructor*, and returns a new wrapped Pipe — using
   what you practiced in 4.3.

If you can do this capstone without peeking, you've got the fluency this port
actually needs — everything else is just applying the same five ideas to more
classes.

---

## Solutions

<details>
<summary>1.1</summary>

```typescript
function* countTo(n: number): Generator<number> {
  for (let i = 1; i <= n; i++) yield i;
}
for (const val of countTo(5)) console.log(val);
```
</details>

<details>
<summary>1.2</summary>

```typescript
function* logAndYield(): Generator<number> {
  console.log("about to yield 1");
  yield 1;
  console.log("about to yield 2");
  yield 2;
}
const g = logAndYield();
console.log("generator created, nothing ran yet");
g.next();
g.next();
```
</details>

<details>
<summary>1.3</summary>

```typescript
function* wrapWhole(arr: number[]): Generator<number[]> {
  yield arr;
}
function* wrapEach(arr: number[]): Generator<number> {
  yield* arr;
}
console.log([...wrapWhole([1,2,3])]); // [[1,2,3]]  <- one item, the whole array
console.log([...wrapEach([1,2,3])]);  // [1,2,3]    <- three items, one each
```
</details>

<details>
<summary>1.4</summary>

```typescript
class Countdown {
  start: number;
  constructor(start: number) { this.start = start; }
  *process(): Generator<number> {
    for (let i = this.start; i >= 1; i--) yield i;
  }
}
console.log([...new Countdown(5).process()]);
```
</details>

<details>
<summary>1.5</summary>

```typescript
function* doubleEach(source: Generator<number>): Generator<number> {
  for (const val of source) yield val * 2;
}
console.log([...doubleEach(countTo(4))]); // [2,4,6,8]
```
</details>

<details>
<summary>2.1</summary>

```typescript
interface HasName { name: string; }
class Dog { name: string; breed: string; constructor(n: string, b: string) { this.name = n; this.breed = b; } }
class Company { name: string; revenue: number; constructor(n: string, r: number) { this.name = n; this.revenue = r; } }
function greet(x: HasName) { console.log(`Hello, ${x.name}`); }
greet(new Dog("Rex", "Lab"));
greet(new Company("Acme", 1000000));
```
</details>

<details>
<summary>2.2</summary>

```typescript
interface Soundmaker { makeSound(): string; }
class Dog implements Soundmaker { makeSound() { return "Woof"; } }
class Car implements Soundmaker { makeSound() { return "Vroom"; } }
class Alarm implements Soundmaker { makeSound() { return "Beep"; } }
function playSound(s: Soundmaker) { console.log(s.makeSound()); }
[new Dog(), new Car(), new Alarm()].forEach(playSound);
```
</details>

<details>
<summary>2.3</summary>

```typescript
class Robot { label: string; constructor(l: string) { this.label = l; } }
greet(new Robot("R2D2")); // Error: Property 'name' is missing in type 'Robot'
```
</details>

<details>
<summary>2.4</summary>

The field version (`getValue: number`) says "this must be a stored value that
already IS a number." A method (`getValue(): number { return 5; }`) is a
*function*, not a number — so it doesn't match a field typed as `number`.
Fixing it to `getValue(): number;` (with parens) makes the interface describe
a callable method instead, matching the real implementation.
</details>

<details>
<summary>3.1</summary>

```typescript
function identity<T>(x: T): T { return x; }
const a = identity(5);        // number
const b = identity("hi");     // string
const c = identity({ x: 1 }); // { x: number }
```
</details>

<details>
<summary>3.2</summary>

```typescript
class Box<T> {
  value: T;
  constructor(value: T) { this.value = value; }
  get(): T { return this.value; }
}
console.log(new Box(5).get());     // number
console.log(new Box("hi").get());  // string
```
</details>

<details>
<summary>3.3</summary>

```typescript
class Wrapper<T> {
  items: T[];
  constructor(items: T[]) { this.items = items; }
  *process(): Generator<T> { yield* this.items; }
}
console.log([...new Wrapper([1,2,3]).process()]);
console.log([...new Wrapper(["a","b"]).process()]);
```
</details>

<details>
<summary>3.4</summary>

```typescript
function getId<T extends { id: number }>(x: T): number { return x.id; }
getId({ id: 5, name: "ok" });     // fine
getId({ name: "no id field" });   // Error: Property 'id' is missing
```
</details>

<details>
<summary>3.5</summary>

```typescript
class Transformer<TIn, TOut> {
  transform: (x: TIn) => TOut;
  constructor(transform: (x: TIn) => TOut) { this.transform = transform; }
  run(x: TIn): TOut { return this.transform(x); }
}
const numToStr = new Transformer<number, string>(n => n.toString());
const strToLen = new Transformer<string, number>(s => s.length);
console.log(numToStr.run(42));    // "42"
console.log(strToLen.run("hey")); // 3
```
</details>

<details>
<summary>4.1</summary>

```typescript
function applyTwice(x: number, fn: (n: number) => number): number {
  return fn(fn(x));
}
console.log(applyTwice(5, n => n + 1)); // 7
```
</details>

<details>
<summary>4.2</summary>

```typescript
class Calculator {
  operation: (a: number, b: number) => number;
  constructor(operation: (a: number, b: number) => number) { this.operation = operation; }
  compute(a: number, b: number) { return this.operation(a, b); }
}
const adder = new Calculator((a, b) => a + b);
const multiplier = new Calculator((a, b) => a * b);
console.log(adder.compute(2, 3));      // 5
console.log(multiplier.compute(2, 3)); // 6
```
</details>

<details>
<summary>4.3</summary>

```typescript
interface Describable { describe(): string; }
type DescribableConstructor = new (input: string) => Describable;

class Greeting implements Describable {
  text: string;
  constructor(input: string) { this.text = input; }
  describe() { return `Greeting: ${this.text}`; }
}
class Shout implements Describable {
  text: string;
  constructor(input: string) { this.text = input.toUpperCase(); }
  describe() { return `Shout: ${this.text}!`; }
}
function build(Ctor: DescribableConstructor, input: string): Describable {
  return new Ctor(input);
}
console.log(build(Greeting, "hi").describe());
console.log(build(Shout, "hi").describe());
```
</details>

<details>
<summary>5 (capstone)</summary>

```typescript
interface Pipe<T> { process(): Generator<T>; }

class ArraySource<T> implements Pipe<T> {
  items: T[];
  constructor(items: T[]) { this.items = items; }
  *process(): Generator<T> { yield* this.items; }
}

class DoubleStep implements Pipe<number> {
  pipe: Pipe<number>;
  constructor(pipe: Pipe<number>) { this.pipe = pipe; }
  *process(): Generator<number> {
    for (const item of this.pipe.process()) yield item * 2;
  }
}

class ToStringStep<T> implements Pipe<string> {
  pipe: Pipe<T>;
  constructor(pipe: Pipe<T>) { this.pipe = pipe; }
  *process(): Generator<string> {
    for (const item of this.pipe.process()) yield String(item);
  }
}

const chain = new ToStringStep(new DoubleStep(new ArraySource([1, 2, 3])));
console.log([...chain.process()]); // ["2", "4", "6"]

// Stretch — generic connect helper:
type StepConstructor<TIn, TOut> = new (pipe: Pipe<TIn>) => Pipe<TOut>;
function connect<TIn, TOut>(pipe: Pipe<TIn>, Step: StepConstructor<TIn, TOut>): Pipe<TOut> {
  return new Step(pipe);
}
const chain2 = connect(connect(new ArraySource([1,2,3]), DoubleStep), ToStringStep);
console.log([...chain2.process()]); // ["2", "4", "6"]
```
</details>