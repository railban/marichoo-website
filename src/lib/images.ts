import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

// Every raster image lives in src/assets/media so Astro can resize and re-encode it at build time.
// Content still refers to them as /media/<file>, which is resolved here.
const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/media/*', { eager: true });
const assets = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(modules)) {
  assets.set(path.slice(path.lastIndexOf('/') + 1).normalize('NFC'), mod.default);
}

export function assetFor(src: string | undefined): ImageMetadata | undefined {
  if (!src?.startsWith('/media/')) return undefined;
  let name = src.slice('/media/'.length);
  try {
    name = decodeURIComponent(name);
  } catch {
    /* already decoded */
  }
  return assets.get(name.normalize('NFC'));
}

const WIDTHS = [400, 800, 1200, 1600, 2000];
// Content column is 58rem, wide blocks and grids are 120rem.
export const SIZES_CONTENT = 'auto, (min-width: 1240px) 1200px, 100vw';

export interface Responsive {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

/** Responsive WebP variants of a /media image, capped at `maxWidth` pixels. */
export async function responsive(src: string | undefined, maxWidth = 2000): Promise<Responsive | null> {
  const asset = assetFor(src);
  if (!asset) return null;
  const top = Math.min(asset.width, maxWidth);
  const widths = [...WIDTHS.filter((w) => w < top), top];
  const image = await getImage({ src: asset, width: top, widths, format: 'webp' });
  return {
    src: image.src,
    srcset: image.srcSet.attribute,
    width: asset.width,
    height: asset.height,
  };
}

/** A single JPEG/PNG rendition for social previews (og:image); not every crawler understands WebP. */
export async function socialImage(src: string | undefined) {
  const asset = assetFor(src);
  if (!asset) return null;
  const width = Math.min(asset.width, 1200);
  // PNGs keep their format so transparent artwork does not get a black background.
  const image = await getImage({ src: asset, width, format: asset.format === 'png' ? 'png' : 'jpg' });
  return { src: image.src, width, height: Math.round((asset.height * width) / asset.width) };
}

function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of tag.matchAll(/([\w-]+)="([^"]*)"/g)) attrs[match[1]] = match[2];
  return attrs;
}

function escapeAttr(value: string): string {
  return value.replace(/&(?!#?\w+;)/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Rewrites the <img> tags of imported WordPress HTML into responsive, lazily loaded images.
 * Images without a source are dropped, and empty alt texts fall back to `fallbackAlt`.
 */
export async function optimizeHtml(html: string, fallbackAlt: string): Promise<string> {
  const tags = [...html.matchAll(/<img\b[^>]*>/g)];
  const replacements = await Promise.all(
    tags.map(async ([tag]) => {
      const attrs = attributes(tag);
      if (!attrs.src) return '';
      const alt = escapeAttr(attrs.alt?.trim() || fallbackAlt);
      const cls = attrs.class ? ` class="${attrs.class}"` : '';
      const image = await responsive(attrs.src);
      if (!image) {
        return `<img src="${attrs.src}" alt="${alt}"${cls} loading="lazy" decoding="async" />`;
      }
      // WordPress "resized" images carry their display size; keep it so the layout matches.
      const width = Number(attrs.width) || image.width;
      const height = Number(attrs.height) || Math.round((image.height * width) / image.width);
      return `<img src="${image.src}" srcset="${image.srcset}" sizes="${SIZES_CONTENT}" width="${width}" height="${height}" alt="${alt}"${cls} loading="lazy" decoding="async" />`;
    }),
  );
  let index = 0;
  return html
    .replace(/<img\b[^>]*>/g, () => replacements[index++])
    .replace(/<figure[^>]*>\s*<\/figure>/g, '');
}
