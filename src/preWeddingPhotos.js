// Add web-sized images to assets/prewedding/web, then rebuild/deploy.
const files = import.meta.glob('./assets/prewedding/web/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}', {
  eager: true,
  query: '?url',
  import: 'default',
});
export const preWeddingPhotos = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))
  .map(([path, src], index) => ({ id: path, src, alt: `ภาพพรีเวดดิ้งของมิ่งกมลและยุทธกิจ ภาพที่ ${index + 1}` }));
