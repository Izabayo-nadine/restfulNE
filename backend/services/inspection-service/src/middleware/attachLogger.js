export const attachLogger = (logger) => (req, _res, next) => {
  req.logger = logger;
  next();
};
