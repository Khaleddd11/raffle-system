import { z } from "zod";
import { GRADES } from "./grades";
import { normalizeEgyptPhone } from "./phone";

const today = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

export const registrationSchema = z
  .object({
    kidName: z
      .string()
      .trim()
      .min(2, "Please enter a valid name")
      .regex(/^[\p{L}\s']+$/u, "Please enter a valid name"),
    dateOfBirth: z.string().refine((value) => {
      const date = new Date(value);
      return Boolean(value) && !Number.isNaN(date.getTime()) && date < today();
    }, "Date of birth must be in the past"),
    grade: z.enum([...GRADES] as [typeof GRADES[number], ...typeof GRADES[number][]], {
      errorMap: () => ({ message: "Please select a grade" }),
    }),
    parentName: z.string().trim().min(2, "Please enter a valid name"),
    parentPhone: z.string(),
    smsConsent: z.boolean().optional().default(false),
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
    };
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

