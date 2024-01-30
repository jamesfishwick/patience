import { expect, describe, test } from "@jest/globals";
import {
  findUnique,
  findUniqueCommon,
  longestCommonSubsequence,
  patienceDiff,
  patienceDiffPlus,
} from "../src/index";

describe("findUnique", () => {
  test("returns map of unique lines", () => {
    const map = ["a", "aaa", "b", "c", "a"];
    const result = findUnique(map, 0, 4);

    expect(result.size).toBe(3);
    expect(result.has("aaa")).toBeTruthy();
    expect(result.has("b")).toBeTruthy();
    expect(result.has("c")).toBeTruthy();
  });

  test("handles empty input", () => {
    const input: string[] = [];
    const result = findUnique(input, 0, -1);

    expect(result.size).toBe(0);
  });
});

describe("uniqueCommon", () => {
  test("finds common unique lines", () => {
    const a = ["aye", "bee", "sea", "aye"];
    const b = ["bee", "sea", "dee"];
    const result = findUniqueCommon(a, 0, 3, b, 0, 2);

    expect(result.size).toBe(2);
    expect(result.has("bee")).toBeTruthy();
    expect(result.has("sea")).toBeTruthy();
  });

  test("handles moved common unique lines", () => {
    const a = ["aye", "bee", "sea"];
    const b = ["bee", "sea", "aye"];
    const result = findUniqueCommon(a, 0, 3, b, 0, 2);

    expect(result.size).toBe(3);
    expect(result.has("bee")).toBeTruthy();
    expect(result.has("sea")).toBeTruthy();
    expect(result.has("aye")).toBeTruthy();
  });

  test("handles no common lines", () => {
    const a = ["a", "b", "c"];
    const b = ["d", "e", "f"];
    const result = findUniqueCommon(a, 0, 2, b, 0, 2);

    expect(result.size).toBe(0);
  });
});

describe("longestCommonSubsequence", () => {
  test("returns longest subsequence", () => {
    const input = new Map([
      ["a", { indexA: 0, indexB: 0 }],
      ["b", { indexA: 1, indexB: 1 }],
      ["c", { indexA: 2, indexB: 2 }],
    ]);
    const result = longestCommonSubsequence(input);

    expect(result.length).toBe(3);
    expect(result[0].indexA).toBe(0);
    expect(result[1].indexA).toBe(1);
    expect(result[2].indexA).toBe(2);
  });

  test("handles empty input", () => {
    const input = new Map();
    const result = longestCommonSubsequence(input);

    expect(result.length).toBe(0);
  });
});

describe("patienceDiff", () => {
  test("returns correct diff for identical arrays", () => {
    const orig = ["line1", "line2"];
    const newArr = ["line1", "line2"];

    const result = patienceDiff(orig, newArr);

    expect(result.lines).toEqual([
      { line: "line1", aIndex: 0, bIndex: 0 },
      { line: "line2", aIndex: 1, bIndex: 1 },
    ]);
    expect(result.lineCountDeleted).toBe(0);
    expect(result.lineCountInserted).toBe(0);
  });

  test("returns correct diff for different arrays", () => {
    const orig = ["line1", "line2", "line3"];
    const newArr = ["line1", "line4", "line3"];

    const result = patienceDiff(orig, newArr);

    expect(result.lines).toEqual([
      { line: "line1", aIndex: 0, bIndex: 0 },
      { line: "line2", aIndex: 1, bIndex: -1 },
      { line: "line4", aIndex: -1, bIndex: 1 },
      { line: "line3", aIndex: 2, bIndex: 2 },
    ]);
    expect(result.lineCountDeleted).toBe(1);
    expect(result.lineCountInserted).toBe(1);
  });

  test("handles empty original array", () => {
    const orig: string[] = [];
    const newArr = ["newLine1", "newLine2"];

    const result = patienceDiff(orig, newArr);

    expect(result.lines).toEqual([
      { line: "newLine1", aIndex: -1, bIndex: 0 },
      { line: "newLine2", aIndex: -1, bIndex: 1 },
    ]);
    expect(result.lineCountDeleted).toBe(0);
    expect(result.lineCountInserted).toBe(2);
  });

  test("handles empty new array", () => {
    const orig = ["origLine1", "origLine2"];
    const newArr: string[] = [];

    const result = patienceDiff(orig, newArr);

    expect(result.lines).toEqual([
      { line: "origLine1", aIndex: 0, bIndex: -1 },
      { line: "origLine2", aIndex: 1, bIndex: -1 },
    ]);
    expect(result.lineCountDeleted).toBe(2);
    expect(result.lineCountInserted).toBe(0);
  });

  test("lineCountMoved is 0 when diffPlusFlag not passed", () => {
    const orig = ["line1"];
    const newArr = ["line2"];

    const result = patienceDiff(orig, newArr);

    expect(result.lineCountMoved).toBe(0);
  });

  test("returns corrrect diff for moved lines", () => {
    const orig = ["line1", "line2", "line3"];
    const newArr = ["line2", "line3", "line1"];

    const result = patienceDiff(orig, newArr);

    expect(result.lineCountMoved).toBe(1);
    expect(result.lines[0]).toEqual({
      line: "line 2",
      aIndex: 1,
      bIndex: 0,
    });
  });
});

describe("patienceDiffPlus", () => {
  it("should diff two identical arrays", () => {
    const orig = ["line 1", "line 2"];
    const newArr = ["line 1", "line 2"];

    const result = patienceDiffPlus(orig, newArr);

    expect(result.lines).toEqual([
      { line: "line 1", aIndex: 0, bIndex: 0 },
      { line: "line 2", aIndex: 1, bIndex: 1 },
    ]);
    expect(result.lineCountDeleted).toBe(0);
    expect(result.lineCountInserted).toBe(0);
    expect(result.lineCountMoved).toBe(0);
  });

  it("should detect inserted lines", () => {
    const orig = ["line 1", "line 2"];
    const newArr = ["line 1", "new line", "line 2"];

    const result = patienceDiffPlus(orig, newArr);

    expect(result.lineCountInserted).toBe(1);
    expect(result.lines[1]).toEqual({
      line: "new line",
      aIndex: -1,
      bIndex: 1,
    });
  });

  it("should detect deleted lines", () => {
    const orig = ["line 1", "line 2"];
    const newArr = ["line 1"];

    const result = patienceDiffPlus(orig, newArr);

    expect(result.lineCountDeleted).toBe(1);
    expect(result.lines[1]).toEqual({
      line: "line 2",
      aIndex: 1,
      bIndex: -1,
    });
  });

  it("should detect moved lines", () => {
    const orig = ["line1", "line2", "line3"];
    const newArr = ["line2", "line1", "line3"];

    const result = patienceDiffPlus(orig, newArr);

    expect(result.lineCountMoved).toBe(1);
    expect(result.lines[0]).toEqual({
      line: "line 2",
      aIndex: 1,
      bIndex: 0,
      moved: true,
    });
  });
});
