import type { CSSProperties } from 'react';
import type { ShareConfig } from './types';

/**
 * Computes custom CSS variables and inline styles for white-labeled share dashboards.
 */
export function getShareBrandingStyles(shareConfig?: ShareConfig): CSSProperties {
  if (!shareConfig) return {};

  const styles: Record<string, string> = {};

  if (shareConfig.primaryColor) {
    styles['--share-primary'] = shareConfig.primaryColor;
    styles['--zen-primary'] = shareConfig.primaryColor;
  }
  if (shareConfig.backgroundColor) {
    styles['--share-bg'] = shareConfig.backgroundColor;
    styles['--zen-surface-raised'] = shareConfig.backgroundColor;
    styles['backgroundColor'] = shareConfig.backgroundColor;
  }
  if (shareConfig.cardBackgroundColor) {
    styles['--share-card-bg'] = shareConfig.cardBackgroundColor;
    styles['--zen-surface'] = shareConfig.cardBackgroundColor;
  }
  if (shareConfig.textColor) {
    styles['--share-text-color'] = shareConfig.textColor;
    styles['--zen-fg'] = shareConfig.textColor;
    styles['color'] = shareConfig.textColor;
  }

  return styles as CSSProperties;
}

/**
 * Optimizes an uploaded image file on the client using HTML5 Canvas to a lightweight, responsive data URL.
 */
export function resizeImageFile(file: File, maxWidth = 400, maxHeight = 120): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(reader.result as string);
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
