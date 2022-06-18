import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const dateFormat = "MMMM D, YYYY";

export function format(date: Date) {
  return dayjs(date).format(dateFormat);
}

export function parse(date: string) {
  return dayjs.utc(date, dateFormat).toDate();
}
