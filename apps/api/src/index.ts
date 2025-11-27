import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRouter } from './routes/auth';
import { adminRouter } from './routes/admin';
import { volunteersRouter } from './routes/volunteers';
import { organizationsRouter } from './routes/organizations';
import { opportunitiesRouter } from './routes/opportunities';
import { applicationsRouter } from './routes/applications';
import { participationsRouter } from './routes/participations';

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Just a Drop API',
          version: '1.0.0',
          description: 'API for connecting volunteers with organizations',
        },
        tags: [
          { name: 'auth', description: 'Authentication endpoints' },
          { name: 'admin', description: 'Admin endpoints' },
          { name: 'volunteers', description: 'Volunteer endpoints' },
          { name: 'organizations', description: 'Organization endpoints' },
          { name: 'opportunities', description: 'Opportunity endpoints' },
          { name: 'applications', description: 'Application endpoints (legacy)' },
          { name: 'participations', description: 'Participation endpoints' },
        ],
      },
    })
  )
  .get('/', () => ({ message: 'Just a Drop API' }))
  .get('/health', () => ({ status: 'ok' }))
  .use(authRouter)
  .use(adminRouter)
  .use(volunteersRouter)
  .use(organizationsRouter)
  .use(opportunitiesRouter)
  .use(applicationsRouter)
  .use(participationsRouter)
  .listen(3001);

console.log(`API running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`OpenAPI docs at http://${app.server?.hostname}:${app.server?.port}/swagger`);
