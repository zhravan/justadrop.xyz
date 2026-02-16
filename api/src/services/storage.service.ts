import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createId } from '@paralleldrive/cuid2';
import {
  FILE_CLASSES,
  FILE_CLASS_VALUES,
  BUCKET_NAME,
  MAX_FILE_SIZE_BYTES,
  type FileClass,
} from '../constants/storage.js';
import {
  InvalidFileClassError,
  InvalidFileTypeError,
  FileTooLargeError,
  StorageNotFoundError,
  StorageUploadError,
} from '../utils/errors.js';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'application/pdf': 'pdf',
};

function getExtension(mimeType: string): string {
  return MIME_TO_EXT[mimeType] ?? 'bin';
}

function isValidFileClass(value: string): value is FileClass {
  return FILE_CLASS_VALUES.includes(value as FileClass);
}

export class StorageService {
  private client: SupabaseClient | null = null;

  private getClient(): SupabaseClient {
    if (!this.client) {
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
      }
      this.client = createClient(url, key);
    }
    return this.client;
  }

  private validateFileClass(fileClass: string): asserts fileClass is FileClass {
    if (!isValidFileClass(fileClass)) {
      throw new InvalidFileClassError(fileClass);
    }
  }

  private validateFile(
    file: { type: string; size: number },
    fileClass: FileClass
  ): void {
    const config = FILE_CLASSES[fileClass];
    if (!(config.allowedTypes as readonly string[]).includes(file.type)) {
      throw new InvalidFileTypeError(fileClass, file.type, config.allowedTypes);
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(fileClass, 1, file.size);
    }
  }

  private sanitizePath(path: string): string {
    const cleaned = path.replace(/\.\./g, '').replace(/^\/+|\/+$/g, '');
    if (!cleaned || cleaned.includes('..')) {
      throw new StorageNotFoundError(path);
    }
    return cleaned;
  }

  async upload(
    fileClass: string,
    file: { type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> },
    userId?: string
  ): Promise<{ url: string; assetKey: string }> {
    this.validateFileClass(fileClass);
    this.validateFile(file, fileClass);

    const ext = getExtension(file.type);
    const prefix = userId ? `${fileClass}/${userId}` : fileClass;
    const filename = `${createId()}.${ext}`;
    const assetKey = `${prefix}/${filename}`;

    const client = this.getClient();
    const buffer = await file.arrayBuffer();
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(assetKey, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw new StorageUploadError(fileClass, 'upload', error.message);
    }

    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      assetKey,
    };
  }

  async getUrl(assetKey: string): Promise<{ url: string; assetKey: string }> {
    const path = this.sanitizePath(assetKey);
    const client = this.getClient();

    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(path);

    return {
      url: urlData.publicUrl,
      assetKey: path,
    };
  }

  async replace(
    assetKey: string,
    file: { type: string; size: number; arrayBuffer: () => Promise<ArrayBuffer> }
  ): Promise<{ url: string; assetKey: string }> {
    const path = this.sanitizePath(assetKey);
    const fileClass = path.split('/')[0] as string;
    this.validateFileClass(fileClass);
    this.validateFile(file, fileClass);

    const client = this.getClient();
    const buffer = await file.arrayBuffer();
    const { data, error } = await client.storage
      .from(BUCKET_NAME)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw new StorageUploadError(fileClass, 'replace', error.message);
    }

    const { data: urlData } = client.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      assetKey: path,
    };
  }

  async delete(assetKey: string): Promise<void> {
    const path = this.sanitizePath(assetKey);
    const client = this.getClient();

    const { error } = await client.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      throw new StorageUploadError(path.split('/')[0], 'delete', error.message);
    }
  }
}
