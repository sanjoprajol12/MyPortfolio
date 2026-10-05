// Express 4 does not catch rejected promises from async handlers; pass them to next()
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
