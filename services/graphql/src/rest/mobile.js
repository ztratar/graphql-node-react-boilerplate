import { Router } from 'express';
import debug from 'debug';
import Promise from 'bluebird';

const router = Router();

const log = debug('graphql:rest:mobile');

router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send({
      message: 'You are not allowed to do that'
    });
  }
  next();
});

router.post('/avatar', async (req, res, next) => {
  const { files, context: { user, models: { User } } } = req;
  try {
    log('receiving avatar upload request from user "%s"', user.id);

    await User.updateAvatar(user, files[0]);

    return res.status(204).send();
  } catch (e) {
    log(e);
    next(e);
  }
});

export default router;
