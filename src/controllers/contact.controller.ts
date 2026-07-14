import type { RequestHandler } from 'express';

import { sendContactEmail } from '../services/email.service';

interface ContactBody {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const sendContact: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body as ContactBody;
    await sendContactEmail({ name, email, subject, message });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (err) {
    return next(err);
  }
};
