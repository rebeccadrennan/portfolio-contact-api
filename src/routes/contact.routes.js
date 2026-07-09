'use strict';

const { Router } = require('express');
const { sendContact } = require('../controllers/contact.controller');
const { contactRateLimit } = require('../middleware/rateLimit.middleware');
const validate = require('../middleware/validate.middleware');
const { contactSchema } = require('../validators/contact.validator');

const router = Router();

router.post('/', contactRateLimit, validate(contactSchema), sendContact);

module.exports = router;
