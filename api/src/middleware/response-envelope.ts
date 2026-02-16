import { Elysia } from 'elysia';
import { successResponse } from '../utils/response';

export const responseEnvelope = new Elysia()
  .onAfterHandle(({ response, set }) => {
    const status = typeof set.status === 'number' ? set.status : 200;
    if (status >= 200 && status < 300) {
      if (response && typeof response === 'object' && 'success' in response) {
        return response;
      }
      return successResponse(response);
    }
    return response;
  });
