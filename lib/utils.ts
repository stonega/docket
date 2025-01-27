import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const dateFromNow = (date: string) => {
  return dayjs(date).fromNow(); // 22 years ago
};
export const formateDate = (date: string) => {
  return dayjs(date).toDate().toLocaleString("en-US")
}
export function getDocUrl(link: string) {
  const keywords = ["docs", "guide", "learn", "tutorial"];
  try {
    const url = new URL(link);
    const hostname = url.hostname;
    const protocol = url.protocol;
    const pathname = url.pathname;
    const path = pathname.split("/");
    const index = path.findIndex((item) => keywords.includes(item));
    const docPath = path.slice(0, index + 1).join("/");
    return protocol + "//" + hostname + docPath;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}

export function getSubPaths(link: string) {
  try {
    const url = new URL(link);
    const hostname = url.hostname;
    const protocol = url.protocol;
    const pathname = url.pathname;
    const path = pathname.split("/");
    const result = [];
    for (let i = 0; i < path.length; i++) {
      const docPath = path.slice(0, i + 1).join("/");
      let p = protocol + "//" + hostname + docPath;
      if (p.endsWith("/")) p = p.slice(0, p.length - 1);
      result.push(p);
    }
    return Array.from(new Set(result)).reverse();
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
