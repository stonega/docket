import { getSubPaths, getDocUrl } from "../lib/utils";
import { expect, test } from "vitest";

test("Utils test", () => {
  let testUrl = "https://react.dev/learn/typescript";
  let docUrl = getDocUrl(testUrl);
  let urls = getSubPaths(testUrl);
  expect(docUrl).toBe("https://react.dev/learn");
  expect(urls).toStrictEqual([
    "https://react.dev",
    "https://react.dev/learn",
    "https://react.dev/learn/typescript",
  ].reverse());
  testUrl = "https://tailwindcss.com/docs/installation";
  docUrl = getDocUrl(testUrl);
  urls = getSubPaths(testUrl);
  expect(docUrl).toBe("https://tailwindcss.com/docs");
  expect(urls).toStrictEqual([
    "https://tailwindcss.com",
    "https://tailwindcss.com/docs",
    "https://tailwindcss.com/docs/installation",
  ].reverse());
  testUrl = "https://tailwindcss.com/do/installation";
  docUrl = getDocUrl(testUrl);
  expect(docUrl).toBe("https://tailwindcss.com");
  testUrl =
    "https://nextjs.org/docs/pages/building-your-application/optimizing/testing";
  docUrl = getDocUrl(testUrl);
  expect(docUrl).toBe("https://nextjs.org/docs");

  (testUrl = "https://vuejs.org"), (docUrl = getDocUrl(testUrl));
  urls = getSubPaths(testUrl);
  expect(docUrl).toBe(testUrl);
  expect(urls).toStrictEqual([testUrl]);
});
