export type ApiResponse<T = any> = {
  status: 'success' | 'error';
  data?: T;
  message?: string;
};

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    status: 'success',
    data,
    message,
  };
};

export const errorResponse = (message: string): ApiResponse => {
  return {
    status: 'error',
    message,
  };
};

