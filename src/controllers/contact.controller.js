'use strict';

const { sendContactEmail } = require('../services/email.service');

const sendContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    await sendContactEmail({ name, email, subject, message });

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully.',
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { sendContact };
