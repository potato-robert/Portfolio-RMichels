export type ImageVariantSet = Partial<Record<(typeof import('./constants').IMAGE_WIDTHS)[number], string>>;

export interface ImageAssetEntry {
  kind: 'image';
  /** Public URL of mozjpeg (or PNG) master at original path */
  url: string;
  sourceRel: string;
  width: number;
  height: number;
  dominantColor: string;
  placeholder: string;
  avif: ImageVariantSet;
  webp: ImageVariantSet;
}

export interface VideoAssetEntry {
  kind: 'video';
  url: string;
  sourceRel: string;
  poster: string;
  webm: string;
  width: number;
  height: number;
}

export interface PassthroughAssetEntry {
  kind: 'passthrough';
  url: string;
  sourceRel: string;
}

export type AssetEntry = ImageAssetEntry | VideoAssetEntry | PassthroughAssetEntry;

export interface RmAssetsManifest {
  version: number;
  optionVersion: number;
  generatedAt: string;
  entries: Record<string, AssetEntry>;
}
