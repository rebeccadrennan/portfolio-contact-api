import { z } from 'zod';

// Basic patterns used to reject obvious script/HTML injection
const noHtmlOrScript = (value: string): boolean => {
  const htmlOrScript = /<[^>]*>|javascript\s*:/i;
  return !htmlOrScript.test(value);
};

export const contactSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .trim()
    .min(1, 'Name is required.')
    .max(100, 'Name must be at most 100 characters.')
    .refine(noHtmlOrScript, 'Name must not contain HTML or script content.'),

  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .min(1, 'Email is required.')
    .max(200, 'Email must be at most 200 characters.')
    .email('Please provide a valid email address.'),

  subject: z
    .string({ required_error: 'Subject is required.' })
    .trim()
    .min(1, 'Subject is required.')
    .max(150, 'Subject must be at most 150 characters.')
    .refine(noHtmlOrScript, 'Subject must not contain HTML or script content.'),

  message: z
    .string({ required_error: 'Message is required.' })
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(2000, 'Message must be at most 2000 characters.')
    .refine(noHtmlOrScript, 'Message must not contain HTML or script content.'),
});
