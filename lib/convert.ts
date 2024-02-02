import { fromHtml } from "hast-util-from-html";
import { toMdast } from "hast-util-to-mdast";
import { toMarkdown } from "mdast-util-to-markdown";
import { markdownToBlocks } from "@tryfabric/martian";

export function htmlToNotion() {
  const html = "<h1>Hello <strong>world!</strong></h1>";
  const hast = fromHtml(html, { fragment: true });
  const mdast = toMdast(hast);
  const markdown = toMarkdown(mdast);
  // Markdown string to Notion Blocks
  const blocks = markdownToBlocks(markdown);
  return blocks;
}
