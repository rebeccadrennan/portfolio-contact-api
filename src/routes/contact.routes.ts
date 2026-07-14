import { Router } from 'express';

import { sendContact } from '../controllers/contact.controller';
import { contactRateLimit } from '../middleware/rateLimit.middleware';
import validate from '../middleware/validate.middleware';
import { contactSchema } from '../validators/contact.validator';

const router = Router();

router.post('/', contactRateLimit, validate(contactSchema), sendContact);

export default router;
