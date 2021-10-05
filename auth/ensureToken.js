const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    return res.status(401).send(
      Object.assign({
        ok: 0,
        message: 'Please login.',
      })
    );
  }

  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];
  if (!bearerToken) {
    return res.status(401).send(
      Object.assign({
        ok: 0,
        message: 'you are not authorized',
      })
    );
  }
  req.token = bearerToken;
  return next();
};

module.exports = ensureToken;
