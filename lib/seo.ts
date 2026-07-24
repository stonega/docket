import type { Metadata } from "next";

export const SITE_NAME = "Docket";
export const SITE_TITLE = "Docket — Your Pocket for Knowledge on the Web";
export const SITE_DESCRIPTION =
  "Save highlights, articles, code, and images from across the web in one private, searchable knowledge library.";
export const SITE_URL = new URL("https://docket.space");

const SOCIAL_IMAGE = {
  url: "/docket.png",
  width: 1032,
  height: 1032,
  alt: "Docket logo",
};

export function createOpenGraphMetadata(
  path: string,
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    locale: "en_US",
    url: path,
    siteName: SITE_NAME,
    title,
    description,
    images: [SOCIAL_IMAGE],
  };
}

export function createTwitterMetadata(
  title = SITE_TITLE,
  description = SITE_DESCRIPTION,
): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary",
    title,
    description,
    images: [SOCIAL_IMAGE],
  };
}
