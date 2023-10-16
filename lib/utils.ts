import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const dateFromNow = (date: string) => {
  return dayjs(date).fromNow(); // 22 years ago
};

export function getDocUrl(link: string) {
  const keywords = ['docs', 'guide', 'learn', 'tutorial']
  try {
    const url = new URL(link);
    const hostname = url.hostname;
    const protocol = url.protocol
    const pathname = url.pathname
    const path = pathname.split('/')
    const index = path.findIndex((item) => keywords.includes(item))
    const docPath = path.slice(0, index + 1).join('/')
    return protocol + "//" + hostname + docPath;
  } catch (error) {
    return undefined;
  }
}
