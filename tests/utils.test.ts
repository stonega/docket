import { getDocUrl } from "../lib/utils";
import { expect, test } from "vitest";

test("Utils test", () => {
  let testUrl = "https://react.dev/learn/typescript";
  let docUrl = getDocUrl(testUrl);
  expect(docUrl).toBe("https://react.dev/learn");
  testUrl = "https://tailwindcss.com/docs/installation";
  docUrl = getDocUrl(testUrl);
  expect(docUrl).toBe("https://tailwindcss.com/docs");
  testUrl = "https://tailwindcss.com/do/installation";
  docUrl = getDocUrl(testUrl);
  expect(docUrl).toBe("https://tailwindcss.com");
  testUrl = "https://nextjs.org/docs/pages/building-your-application/optimizing/testing";
  docUrl = getDocUrl(testUrl);
  expect(docUrl).toBe("https://nextjs.org/docs");
});
