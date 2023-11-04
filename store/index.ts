import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const menuAtom = atom(false);
export const siteOneColumnLayoutAtom = atomWithStorage("site-layout", false);
export const selectedMenuAtom = atom("home");
