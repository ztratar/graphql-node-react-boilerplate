import { Router } from 'express';

import analytics from './analytics';
import stripe from './stripe';
import twilio from './twilio';
import sendgrid from './sendgrid';
import mobile from './mobile';

const router = Router();

router.use('/analytics', analytics);
router.use('/stripe', stripe);
router.use('/twilio', twilio);
router.use('/sendgrid', sendgrid);
router.use('/mobile', mobile);

export default router;
