'use strict';

/**
 * sends a 404 status code for unfamiliar routes along with a message saying route is not supported
 * @param {object} req - request object (not used here)
 * @param {object} res - response object used to send the status code and message
 */
module.exports = (req, res, next) => {
  res.status(404).send('route not supported');
};
