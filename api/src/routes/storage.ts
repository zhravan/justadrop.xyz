import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const storageService = container.getServices().storage;

const fileClassSchema = t.Union([
  t.Literal('avatars'),
  t.Literal('org_logos'),
  t.Literal('documents'),
  t.Literal('opportunity_media'),
]);

export const storageRouter = new Elysia({ prefix: '/storage', tags: ['storage'] })
  .use(cookie())
  .use(authMiddleware)
  .post(
    '/',
    async (ctx: any) => {
      const { body, userId } = ctx;
      const file = body.file as File;
      const result = await storageService.upload(body.file_class, file, userId);
      return { url: result.url, assetKey: result.assetKey };
    },
    {
      type: 'multipart/form-data',
      body: t.Object({
        file_class: fileClassSchema,
        file: t.File({ maxSize: '1m' }),
      }),
    }
  )
  .get(
    '/*',
    async ({ params }) => {
      const assetKey = decodeURIComponent(params['*']);
      const result = await storageService.getUrl(assetKey);
      return { url: result.url, assetKey: result.assetKey };
    },
    {
      params: t.Object({
        '*': t.String(),
      }),
    }
  )
  .put(
    '/*',
    async ({ params, body }) => {
      const assetKey = decodeURIComponent(params['*']);
      const file = body.file as File;
      const result = await storageService.replace(assetKey, file);
      return { url: result.url, assetKey: result.assetKey };
    },
    {
      type: 'multipart/form-data',
      params: t.Object({
        '*': t.String(),
      }),
      body: t.Object({
        file: t.File({ maxSize: '1m' }),
      }),
    }
  )
  .delete(
    '/*',
    async ({ params }) => {
      const assetKey = decodeURIComponent(params['*']);
      await storageService.delete(assetKey);
      return { success: true };
    },
    {
      params: t.Object({
        '*': t.String(),
      }),
    }
  );
