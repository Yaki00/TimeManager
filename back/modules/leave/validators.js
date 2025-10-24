import { z } from "zod";

export const LeaveSchema = z.object({
  startDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  endDate: z.string().refine((date) => !Number.isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  justification: z.string().min(1).max(500),
  type: z
    .enum(["Absence", "PaidLeave", "Training", "Remote"])
    .optional()
    .default("PaidLeave"),
});

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }
  return parsed.data;
}

export function validateCreate(req, _res, next) {
  try {
    req.body = validate(LeaveSchema, req.body);
    next();
  } catch (e) {
    next(e);
  }
}
