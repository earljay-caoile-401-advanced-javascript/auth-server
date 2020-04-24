'use strict';

module.exports = (task) => {
  return (req, res, next) => {
    if (req.user.can(task)) {
      next();
    } else {
      next('permission denied');
    }
  };
};
