export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public errors?: any
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class InvalidFileClassError extends AppError {
  constructor(fileClass: string) {
    super(
      `Invalid file_class: "${fileClass}". Must be one of: avatars, org_logos, documents, opportunity_media`,
      400,
      'INVALID_FILE_CLASS'
    );
    this.name = 'InvalidFileClassError';
  }
}

export class InvalidFileTypeError extends AppError {
  constructor(
    public fileClass: string,
    public providedType: string,
    public allowedTypes: readonly string[]
  ) {
    super(
      `File type "${providedType}" is not allowed for file_class "${fileClass}". Allowed: ${allowedTypes.join(', ')}`,
      400,
      'INVALID_FILE_TYPE'
    );
    this.name = 'InvalidFileTypeError';
  }
}

export class FileTooLargeError extends AppError {
  constructor(
    public fileClass: string,
    public maxSizeMb: number,
    public actualSizeBytes: number
  ) {
    super(
      `File exceeds 1 MB limit for file_class "${fileClass}". Max: ${maxSizeMb} MB, received: ${Math.round(actualSizeBytes / 1024)} KB`,
      400,
      'FILE_TOO_LARGE'
    );
    this.name = 'FileTooLargeError';
  }
}

export class StorageNotFoundError extends AppError {
  constructor(path: string) {
    super(`File not found: ${path}`, 404, 'STORAGE_NOT_FOUND');
    this.name = 'StorageNotFoundError';
  }
}

export class StorageUploadError extends AppError {
  constructor(
    public fileClass: string,
    public operation: string,
    message?: string
  ) {
    super(
      message ?? `Failed to ${operation} file for file_class "${fileClass}"`,
      502,
      'STORAGE_UPLOAD_ERROR'
    );
    this.name = 'StorageUploadError';
  }
}
