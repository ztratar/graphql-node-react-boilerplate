export default (err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    res.send(400, {
      errors: [{
        message: 'Your file upload is too large. Only files up to 10mb are allowed.'
      }]
    });
  }

  next();
};
