import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Read',
      uid: 'read',
      pluginName: 'custom-redirects-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Create',
      uid: 'create',
      pluginName: 'custom-redirects-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Update',
      uid: 'update',
      pluginName: 'custom-redirects-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Delete',
      uid: 'delete',
      pluginName: 'custom-redirects-plugin',
    },
    {
      section: 'plugins',
      displayName: 'Bulk Operations',
      uid: 'bulk-operations',
      pluginName: 'custom-redirects-plugin',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};

export default register;
