const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    return res.status(403).send(
      Object.assign(
        { code: 403 },
        {
          ok: 0,
          message: 'Please login.',
        }
      )
    );
  }

  const bearer = bearerHeader.split(' ');
  const bearerToken = bearer[1];
  req.token = bearerToken;
  return next();
};

module.exports = ensureToken;
