import configuration from "./configuration.json";

export const fileUpload = {
  acceptExtensions: configuration.file_upload.accept_extensions,
  acceptMimeTypes: configuration.file_upload.accept_extensions.map((ext) => `image/${ext}`),
  maxFileSizeMb: configuration.file_upload.max_file_size_mb,
  maxFileSize: configuration.file_upload.max_file_size_mb * 1024 * 1024,
} as const;
