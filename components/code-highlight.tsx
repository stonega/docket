"use client";

import parse from "html-react-parser";
import Highlight from "react-highlight";

export default function CodeHighlight({ html }: { html: string }) {
  return <Highlight>{parse(html)}</Highlight>;
}
