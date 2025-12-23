import type { Core } from '@strapi/strapi';

const redirectsController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    try {
      const { query } = ctx;
      const redirects = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .find(query);

      ctx.body = redirects;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async findOne(ctx: any) {
    try {
      const { id } = ctx.params;
      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .findOne(parseInt(id, 10));

      if (!redirect) {
        return ctx.notFound('Redirect not found');
      }

      ctx.body = redirect;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async create(ctx: any) {
    try {
      const { body } = ctx.request;

      const existing = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .findByPath(body.from);

      if (existing) {
        return ctx.badRequest('A redirect with this "from" path already exists');
      }

      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .create(body);

      ctx.body = redirect;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async update(ctx: any) {
    try {
      const { id } = ctx.params;
      const { body } = ctx.request;

      if (body.from) {
        const existing = await strapi
          .plugin('custom-redirects-plugin')
          .service('redirects')
          .findByPath(body.from);

        if (existing && existing.id !== parseInt(id, 10)) {
          return ctx.badRequest('A redirect with this "from" path already exists');
        }
      }

      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .update(parseInt(id, 10), body);

      ctx.body = redirect;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async delete(ctx: any) {
    try {
      const { id } = ctx.params;
      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .delete(parseInt(id, 10));

      ctx.body = redirect;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async deleteMany(ctx: any) {
    try {
      const { ids } = ctx.request.body;
      const result = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .deleteMany(ids);

      ctx.body = result;
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async lookup(ctx: any) {
    try {
      const { from } = ctx.query;

      if (!from) {
        return ctx.badRequest("Missing 'from' query parameter");
      }

      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .findByPath(from);

      if (!redirect) {
        return ctx.notFound('Redirect not found');
      }

      // Increment hit counter
      await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .incrementHits(redirect.id);

      ctx.body = {
        from: redirect.from,
        to: redirect.to,
        type: redirect.type,
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async bulkImport(ctx: any) {
    try {
      const { redirects } = ctx.request.body;

      if (!Array.isArray(redirects)) {
        return ctx.badRequest('Redirects must be an array');
      }

      const result = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .bulkCreate(redirects);

      ctx.body = {
        imported: result.imported.length,
        total: redirects.length,
        skipped: result.skipped,
      };
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});

export default redirectsController;
