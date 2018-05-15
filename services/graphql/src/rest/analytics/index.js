import { Router } from 'express';

import segment from './segment';

const router = Router();

router.use('/segment', segment);

export default router;
