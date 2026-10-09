import { z } from "zod";

export const emailSchema = z.string().trim().email("Enter a valid email address.");
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(8, "Use at least 8 characters."), remember: z.boolean().default(true) });
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: emailSchema,
  password: z.string().min(8, "Use at least 8 characters.").regex(/[A-Za-z]/, "Include at least one letter.").regex(/[0-9]/, "Include at least one number."),
  confirmPassword: z.string(),
  agree: z.boolean().refine(Boolean, "Please accept the demo terms to continue."),
}).refine((values) => values.password === values.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });
export const recoverySchema = z.object({ email: emailSchema });
export const domainSchema = z.object({ domain: z.string().trim().toLowerCase().min(4, "Enter a domain.").regex(/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/, "Enter a domain such as example.com.") });
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter a name."),
  email: emailSchema,
  company: z.string().trim().max(100).default(""),
  tags: z.string().optional(),
  notes: z.string().max(1000).optional(),
});
export const composeSchema = z.object({
  to: z.string().trim().min(1, "Add at least one recipient.").refine((value) => value.split(/[;,]/).every((entry) => z.string().email().safeParse(entry.trim()).success), "Enter valid recipient email addresses."),
  cc: z.string().optional().default(""),
  bcc: z.string().optional().default(""),
  subject: z.string().trim().min(1, "Add a subject."),
  body: z.string().trim().min(1, "Write a message."),
  sender: emailSchema,
});
export const invitationSchema = z.object({ email: emailSchema, role: z.enum(["Admin", "Member"]) });
