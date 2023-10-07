import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const dateFromNow = (date: string) => {
  return dayjs(date).fromNow(); // 22 years ago
};
