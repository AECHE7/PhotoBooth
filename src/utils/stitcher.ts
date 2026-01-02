import { applyFilterToContext, type FilterType } from './filters';

export type LayoutType = 'strip' | 'grid';

export const stitchImages = async (
  images: string[],
  layout: LayoutType,
  filter: FilterType
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (images.length === 0) {
      reject(new Error('No images to stitch'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Load all images first
    const loadedImages = Promise.all(
      images.map((src) => {
        return new Promise<HTMLImageElement>((resolveImg, rejectImg) => {
          const img = new Image();
          img.onload = () => resolveImg(img);
          img.onerror = rejectImg;
          img.src = src;
        });
      })
    );

    loadedImages.then((imgs) => {
      // Assuming all images are the same size (webcam feed)
      const width = imgs[0].width;
      const height = imgs[0].height;

      // Configuration for padding/margins
      const padding = 20;
      const headerHeight = 0; // Space for logo/text if desired later
      const footerHeight = 0;

      if (layout === 'strip') {
        canvas.width = width + padding * 2;
        canvas.height = (height * imgs.length) + (padding * (imgs.length + 1)) + headerHeight + footerHeight;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        applyFilterToContext(ctx, filter);

        imgs.forEach((img, i) => {
          const x = padding;
          const y = padding + (i * (height + padding)) + headerHeight;
          ctx.drawImage(img, x, y, width, height);
        });

      } else if (layout === 'grid') {
        // 2x2 Grid
        canvas.width = (width * 2) + (padding * 3);
        canvas.height = (height * 2) + (padding * 3) + headerHeight + footerHeight;

        // Background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        applyFilterToContext(ctx, filter);

        imgs.forEach((img, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = padding + (col * (width + padding));
          const y = padding + (row * (height + padding)) + headerHeight;
          ctx.drawImage(img, x, y, width, height);
        });
      }

      resolve(canvas.toDataURL('image/png'));
    }).catch(reject);
  });
};
