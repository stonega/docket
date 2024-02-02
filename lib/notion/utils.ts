export function getIconUrl(url: string) {
  const iconUrl = url.split("?")[0];
  if (iconUrl.endsWith("ico") || iconUrl === '') return "https://avatar.tobi.sh/${site.id}.png";
  return iconUrl;
}
