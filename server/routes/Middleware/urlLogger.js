const logger = require('../../../logger/pino');
module.exports = (req, res, next) => {
    logger.info("[@%s] %s", req.method, req.url);
    return next();
};