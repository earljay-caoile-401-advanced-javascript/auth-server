'use strict';

/**
 * sends a 500 status code for routes that are supported but encounter some kind of error
 * @param {object} err - error thrown from an API call to be added in the return error object
 * @param {object} req - request object (not used here)
 * @param {object} res - response object used to send the status code and error object
 * @returns {object}  500 - object containing the error along with custom text
 */
module.exports = (err, req, res, next) => {
  const error = {
    text: 'Server crashed!',
    error: err,
  };
  res.status(500).json(error);
};
