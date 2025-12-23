export default [
  {
    method: 'GET',
    path: '/find',
    handler: 'redirects.lookup',
    config: {
      policies: [],
      // auth: {
      //   scope: ['plugin::custom-redirects-plugin.find'],
      // },
    },
  },
];
