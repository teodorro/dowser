import { describe, expect, it } from "vitest";
import { subtractAverage } from "./subtract-average";

describe("subtractAverage", () => {
  it("should subtract the average of each column from each element", () => {
    const data = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const expected = [
      [-3, -3, -3],
      [0, 0, 0],
      [3, 3, 3],
    ];
    const result = subtractAverage(data);

    expect(result).toEqual(expected);
  });
});
