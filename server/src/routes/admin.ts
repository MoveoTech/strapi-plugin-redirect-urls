export default [
  {
    method: 'GET',
    path: '/redirects',
    handler: 'redirects.find',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.read'],
          },
        },
      ],
    },
  },
  {
    method: 'GET',
    path: '/redirects/:id',
    handler: 'redirects.findOne',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.read'],
          },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/redirects',
    handler: 'redirects.create',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.create'],
          },
        },
      ],
    },
  },
  {
    method: 'PUT',
    path: '/redirects/:id',
    handler: 'redirects.update',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.update'],
          },
        },
      ],
    },
  },
  {
    method: 'DELETE',
    path: '/redirects/:id',
    handler: 'redirects.delete',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.delete'],
          },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/redirects/bulk-delete',
    handler: 'redirects.deleteMany',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.bulk-operations'],
          },
        },
      ],
    },
  },
  {
    method: 'POST',
    path: '/redirects/bulk-import',
    handler: 'redirects.bulkImport',
    config: {
      policies: [
        'admin::isAuthenticatedAdmin',
        {
          name: 'admin::hasPermissions',
          config: {
            actions: ['plugin::custom-redirects-plugin.bulk-operations'],
          },
        },
      ],
    },
  },
];
