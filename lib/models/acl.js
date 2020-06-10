'use strict';

module.exports = {
  guest: ['read'],
  producer: ['read', 'create'],
  editor: ['read', 'update'],
  admin: ['read', 'delete'],
  godEmperor: ['superuser', 'read', 'create', 'update', 'delete'],
};
