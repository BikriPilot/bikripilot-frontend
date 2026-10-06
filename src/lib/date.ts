import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
export const formatDate = (value: string | Date) =>
  dayjs(value).format("D MMM YYYY");
export const dateFromNow = (value: string | Date) => dayjs(value).fromNow();
