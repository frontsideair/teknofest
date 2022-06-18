import { test } from "vitest";
import type { TypeEqual } from "ts-expect";
import { expectType } from "ts-expect";

import type { Jsonify } from "./jsonify";

test("jsonify works", () => {
  function jsonRoundTrip<T>(x: T): Jsonify<T> {
    return JSON.parse(JSON.stringify(x));
  }

  const o = {
    x: 5,
    y: 6,
    toJSON() {
      return this.x + this.y;
    },
  };
  expectType<number>(jsonRoundTrip(o));

  expectType<TypeEqual<never, Jsonify<bigint>>>(true);

  const bucket = {
    n: new Number(3),
    s: new String("false"),
    b: new Boolean(false),
  };
  expectType<{ n: number; s: string; b: boolean }>(jsonRoundTrip(bucket));

  const u = undefined;
  expectType<TypeEqual<never, Jsonify<undefined>>>(true);

  const f = () => {};
  expectType<TypeEqual<never, Jsonify<Function>>>(true);

  const s: symbol = Symbol.for("hello");
  expectType<TypeEqual<never, Jsonify<symbol>>>(true);

  const obj = { u, f, s, keep: "this" };
  expectType<{ keep: string }>(jsonRoundTrip(obj));

  const x7 = jsonRoundTrip([u]);
  expectType<Array<null>>(x7);

  const x8 = jsonRoundTrip([f]);
  expectType<Array<null>>(x8);

  const x9 = jsonRoundTrip([s]);
  expectType<Array<null>>(x9);

  const x10 = jsonRoundTrip({ [s]: "hello", keep: "this" });
  expectType<{ keep: string }>(x10);

  // NOTE: this can't work with TS 4.7.2 or earlier
  // const x11 = jsonRoundTrip(Infinity);
  // expectType<null>(x11);
  // NOTE: this can't work with TS 4.7.2 or earlier
  // const x12 = jsonRoundTrip(NaN);
  // expectType<null>(x12);
  const x13 = jsonRoundTrip(null);
  expectType<null>(x13);

  // const x14 = jsonRoundTrip([
  //   new Int8Array([1]),
  //   new Int16Array([1]),
  //   new Int32Array([1]),
  // ]);
  // NOTE: what should happen here?
});
