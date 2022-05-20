import { z } from "zod";

export const numericString = z.string().regex(/^\d+$/).transform(Number);
