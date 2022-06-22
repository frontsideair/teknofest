import { expect, test } from "vitest";

import { partition } from "./common";

test("partition splits a list", () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const even = (a: number) => a % 2 === 0;

  expect(partition(list, even)).toEqual([
    list.filter(even),
    list.filter((a) => !even(a)),
  ]);
});
