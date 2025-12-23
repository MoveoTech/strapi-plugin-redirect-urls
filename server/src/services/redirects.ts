import type { Core } from '@strapi/strapi';

const redirectsService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async find(query: Record<string, unknown> = {}) {
    return await strapi.db.query('plugin::custom-redirects-plugin.redirect').findMany({
      orderBy: { createdAt: 'desc' },
      ...query,
    });
  },

  async findOne(id: number) {
    return await strapi.db.query('plugin::custom-redirects-plugin.redirect').findOne({
      where: { id },
    });
  },

  async create(data: Record<string, unknown>) {
    return await strapi.db.query('plugin::custom-redirects-plugin.redirect').create({
      data,
    });
  },

  async update(id: number, data: Record<string, unknown>) {
    return await strapi.db.query('plugin::custom-redirects-plugin.redirect').update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return await strapi.db.query('plugin::custom-redirects-plugin.redirect').delete({
      where: { id },
    });
  },

  async deleteMany(ids: number[]) {
    return await strapi.db.query('plugin::custom-redirects-plugin.redirect').deleteMany({
      where: { id: { $in: ids } },
    });
  },

  async findByPath(path: string) {
    const redirects = await strapi.db.query('plugin::custom-redirects-plugin.redirect').findMany({
      where: { from: path },
      limit: 1,
    });

    return redirects.length > 0 ? redirects[0] : null;
  },

  async incrementHits(id: number) {
    const redirect = await this.findOne(id);
    if (redirect) {
      return await this.update(id, {
        hits: (redirect.hits || 0) + 1,
      });
    }
    return null;
  },

  async bulkCreate(redirects: Array<Record<string, unknown>>) {
    const results = [];
    const skipped = [];

    for (const redirectData of redirects) {
      try {
        const existing = await this.findByPath(redirectData.from as string);
        if (existing) {
          skipped.push({
            from: redirectData.from,
            reason: 'Duplicate path',
          });
          continue;
        }

        const result = await this.create(redirectData);
        results.push(result);
      } catch (error) {
        console.error(`Failed to create redirect:`, error);
        skipped.push({
          from: redirectData.from,
          reason: 'Creation failed',
        });
      }
    }
    return { imported: results, skipped };
  },
});

export default redirectsService;
