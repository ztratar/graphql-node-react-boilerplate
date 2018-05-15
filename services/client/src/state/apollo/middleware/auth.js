export default ({ store }) => [{ applyBatchMiddleware: (req, next) => {
  req.options.headers = req.options.headers || {};
  const { app } = store.getState();
  const token = app.getIn(['auth', 'token']);
  if (token) req.options.headers.authorization = `Bearer ${token}`;
  next();
}}];
