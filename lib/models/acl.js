'use strict';

const mongoose = require('mongoose');

const acl = mongoose.Schema({
  guest: ['read'],
  producer: ['read', 'create'],
  editor: ['read', 'update'],
  admin: ['read', 'delete'],
  godEmperor: ['superuser', 'read', 'create', 'update', 'delete'],
});

module.exports = mongoose.model('acl', acl);
