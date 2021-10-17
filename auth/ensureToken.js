const ensureToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (!bearerHeader) {
    return res.status(200).json({
      ok: 0,
      message: "non-login",
    });
  }

  const bearer = bearerHeader.split(" ");
  const bearerToken = bearer[1];
  if (!bearerToken) {
    return res.status(200).json({
      ok: 0,
      message: "non-login",
    });
  }
  req.token = bearerToken;
  return next();
};

module.exports = ensureToken;
