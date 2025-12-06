import { z } from "zod";
import { GRADES } from "./grades";
import { normalizeEgyptPhone } from "./phone";

const today = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

const childSchema = z.object({
  kidName: z
    .string()
    .trim()
    .min(2, "Please enter a valid name")
    // Use a conservative ASCII-friendly regex to avoid Unicode flag issues in older targets.
    .regex(/^[A-Za-z\s']+$/, "Please enter a valid name"),
  dateOfBirth: z.string().refine((value) => {
    const date = new Date(value);
    return Boolean(value) && !Number.isNaN(date.getTime()) && date < today();
  }, "Date of birth must be in the past"),
  grade: z.enum(GRADES as unknown as readonly [typeof GRADES[number], ...typeof GRADES[number][]]),
});

export const registrationSchema = z
  .object({
    children: z.array(childSchema).min(1, "At least one child is required"),
    parentName: z.string().trim().min(2, "Please enter a valid name"),
    parentPhone: z.string(),
    smsConsent: z.boolean().default(false),
  })
  .transform((values, ctx) => {
    const normalizedPhone = normalizeEgyptPhone(values.parentPhone);
    if (!normalizedPhone) {
      ctx.addIssue({
        code: "custom",
        path: ["parentPhone"],
        message: "Phone number must be 10-11 digits",
      });
      return z.NEVER;
    }

    return {
      ...values,
      parentPhone: normalizedPhone,
      smsConsent: values.smsConsent ?? false,
    };
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;
export type RegistrationChildInput = z.infer<typeof childSchema>;

