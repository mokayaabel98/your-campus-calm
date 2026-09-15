import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell us what to call you")
    .max(80, "Please keep this under 80 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  subject: z.string().trim().min(1, "Please add a subject").max(120),
  message: z
    .string()
    .trim()
    .min(10, "Please add a little more detail")
    .max(1000, "Please keep this under 1000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const sendContactEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => contactSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { sendContactNotificationEmails } = await import("./email.server");
      await sendContactNotificationEmails({
        studentName: data.name,
        studentEmail: data.email,
        subject: data.subject,
        message: data.message,
      });

      return {
        ok: true as const,
        message: "Message sent securely. We reply within one working day.",
      };
    } catch (err) {
      console.error("Failed to process contact enquiry:", err);
      return {
        ok: false as const,
        message: "We could not send your message right now. Please try again or email us directly.",
      };
    }
  });
