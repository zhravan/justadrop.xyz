import { Elysia, t } from 'elysia';
import { cookie } from '@elysiajs/cookie';
import { container } from '../container';
import { authMiddleware } from '../middleware/auth.middleware';
import { CAUSE_VALUES } from '../constants/causes.js';

const userRepository = container.getRepositories().user;

const causeSchema = t.Array(t.String({ pattern: `^(${CAUSE_VALUES.join('|')})$` }));

export const usersRouter = new Elysia({ prefix: '/users', tags: ['users'] })
  .use(cookie())
  .use(authMiddleware)
  .patch(
    '/me',
    async (ctx: any) => {
      const { userId, body } = ctx;
      const user = await userRepository.updateUser(userId, {
        name: body.name,
        phone: body.phone,
        gender: body.gender,
        volunteering: body.volunteering,
      });
      return { user };
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        phone: t.Optional(t.String()),
        gender: t.Optional(t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other'), t.Literal('prefer_not_to_say')])),
        volunteering: t.Optional(
          t.Object({
            isInterest: t.Boolean(),
            skills: t.Array(
              t.Object({
                name: t.String(),
                expertise: t.String(),
              })
            ),
            causes: causeSchema,
          })
        ),
      }),
    }
  );
