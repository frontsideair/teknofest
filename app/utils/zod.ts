import { z } from "zod";
import { parse } from "./date";

export const numericString = z.string().regex(/^\d+$/).transform(Number);

export const dateString = z.preprocess((arg) => {
  if (typeof arg === "string") {
    return parse(arg);
  }
}, z.date());

export const dateRangeString = z.preprocess((arg) => {
  if (typeof arg === "string") {
    const [start, end] = arg.split(" – ");
    return { start, end };
  }
}, z.object({ start: dateString, end: dateString }));

export const inviteCodeSchema = z
  .string()
  .uuid("Invite code not in correct format");
