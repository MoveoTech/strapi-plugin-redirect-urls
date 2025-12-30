import type { Core } from '@strapi/strapi';
import { sanitizeRedirectData, sanitizeResponse } from '../utils/sanitize';

const redirectsController = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(ctx: any) {
    try {
      const { query } = ctx;
      const redirects = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .find(query);

      ctx.body = sanitizeResponse(redirects);
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

      ctx.body = sanitizeResponse(redirect);
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async create(ctx: any) {
    try {
      const { body } = ctx.request;

      const sanitizedData = sanitizeRedirectData(body);

      if (!sanitizedData.from || !sanitizedData.to) {
        return ctx.badRequest('Missing required fields: from and to');
      }

      const existing = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .findByPath(sanitizedData.from);

      if (existing) {
        return ctx.badRequest('A redirect with this "from" path already exists');
      }

      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .create(sanitizedData);

      ctx.body = sanitizeResponse(redirect);
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async update(ctx: any) {
    try {
      const { id } = ctx.params;
      const { body } = ctx.request;

      const sanitizedData = sanitizeRedirectData(body);

      if (sanitizedData.from) {
        const existing = await strapi
          .plugin('custom-redirects-plugin')
          .service('redirects')
          .findByPath(sanitizedData.from);

        if (existing && existing.id !== parseInt(id, 10)) {
          return ctx.badRequest('A redirect with this "from" path already exists');
        }
      }

      const redirect = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .update(parseInt(id, 10), sanitizedData);

      ctx.body = sanitizeResponse(redirect);
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

      ctx.body = sanitizeResponse(redirect);
    } catch (err) {
      ctx.throw(500, err);
    }
  },

  async deleteMany(ctx: any) {
    try {
      const { ids } = ctx.request.body;

      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'number')) {
        return ctx.badRequest('Invalid ids array');
      }

      const result = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .deleteMany(ids);

      ctx.body = sanitizeResponse(result);
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

      ctx.body = sanitizeResponse({
        from: redirect.from,
        to: redirect.to,
        type: redirect.type,
      });
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

      const sanitizedRedirects = redirects.map(redirect => sanitizeRedirectData(redirect));

      const validRedirects = sanitizedRedirects.filter(r => r.from && r.to);

      if (validRedirects.length === 0) {
        return ctx.badRequest('No valid redirects to import');
      }

      const result = await strapi
        .plugin('custom-redirects-plugin')
        .service('redirects')
        .bulkCreate(validRedirects);

      const sanitizedResult = sanitizeResponse(result);

      const importedCount = sanitizedResult.imported?.length || 0;
      const skippedCount = sanitizedResult.skipped?.length || 0;
      const totalProcessed = importedCount + skippedCount;

      ctx.body = sanitizeResponse({
        imported: importedCount,
        total: totalProcessed,
        skipped: sanitizedResult.skipped,
      });
    } catch (err) {
      ctx.throw(500, err);
    }
  },
});

export default redirectsController;
