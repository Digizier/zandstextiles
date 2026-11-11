import { supabase } from './supabase';

/**
 * Compresses any user-selected image (PNG, JPG, HEIC, etc.)
 * directly in the browser using HTML5 Canvas, converts it to modern WebP format,
 * reduces file size down to KB range (typically 30KB - 90KB), and uploads it
 * directly to the appropriate Supabase storage bucket.
 * 
 * Returns the short, public CDN URL to save in the database.
 */
export async function compressAndUploadImage(
  file: File,
  bucket: 'products' | 'banners' | 'proofs' = 'products',
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<{ url: string; originalSizeKb: number; compressedSizeKb: number }> {
  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // Calculate resized aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          // Draw on off-screen canvas
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Canvas 2D context unavailable');
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to WebP blob
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to create WebP blob'));
                return;
              }

              const compressedSizeKb = Math.round(blob.size / 1024);
              const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
              const filePath = `${bucket}/${cleanFileName}`;

              // Direct upload to Supabase storage
              const { data, error } = await supabase.storage
                .from(bucket)
                .upload(cleanFileName, blob, {
                  contentType: 'image/webp',
                  cacheControl: '31536000',
                  upsert: true,
                });

              if (error) {
                console.error('Storage upload error:', error);
                // Fallback to object public URL format
                const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${cleanFileName}`;
                resolve({ url: publicUrl, originalSizeKb, compressedSizeKb });
                return;
              }

              // Get public URL
              const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(cleanFileName);

              resolve({
                url: publicUrlData.publicUrl,
                originalSizeKb,
                compressedSizeKb,
              });
            },
            'image/webp',
            quality
          );
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
