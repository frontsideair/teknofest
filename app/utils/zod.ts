import { z } from "zod";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(customParseFormat);
dayjs.extend(utc);

export const numericString = z.string().regex(/^\d+$/).transform(Number);

const dateFormat = "MMM D, YYYY";

export const dateString = z.preprocess((arg) => {
  if (typeof arg === "string") {
    return dayjs.utc(arg, dateFormat).toDate();
  }
}, z.date());

export const dateRangeString = z.preprocess((arg) => {
  if (typeof arg === "string") {
    const [start, end] = arg.split(" – ");
    return { start, end };
  }
}, z.object({ start: dateString, end: dateString }));
