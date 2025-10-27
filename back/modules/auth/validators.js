import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(/[a-z]/, { message: "at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "at least one uppercase letter" })
    .regex(/\d/, { message: "at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "at least one special character" }),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phoneNumber: z.string().min(10).max(15),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(100),
});

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
    const err = new Error(msg);
    err.status = 400;
    err.statusCode = 400;
    err.code = "BAD_REQUEST";
    throw err;
  }
  return parsed.data;
}
