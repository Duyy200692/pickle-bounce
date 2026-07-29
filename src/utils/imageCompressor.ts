/**
 * Utility to convert and compress any uploaded image (.jpg, .png, etc.)
 * into lightweight .webp format using HTML5 Canvas.
 */
export async function convertToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Scale down dimensions if exceeding max limits
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context could not be created'));
          return;
        }

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas output to image/webp data URL
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        resolve(webpDataUrl);
      };
      img.onerror = (error) => reject(error);
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Calculates approximate size in KB for a Data URL or URL string
 */
export function getImageSizeInKB(dataUrl: string): string {
  if (!dataUrl) return '0 KB';
  if (dataUrl.startsWith('data:')) {
    const stringLength = dataUrl.length - dataUrl.indexOf(',') - 1;
    const sizeInBytes = (stringLength * 3) / 4;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    return `${sizeInKB} KB`;
  }
  return 'URL Ngoại';
}

