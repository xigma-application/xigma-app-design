// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality, ExportScale } from './enums';
import { TDraftRect } from 'types/canvas';
import { TExportSetting } from './types';

export const translationNameSpace = `${parentNameSpace}.export`;

export const EXPORT_PREVIEW_SIZE = 256;

export const EXPORT_JPEG_QUALITY: Record<ExportQuality, number> = {
  [ExportQuality.high]: 0.92,
  [ExportQuality.low]: 0.5,
  [ExportQuality.medium]: 0.75,
};

export const EXPORT_MIN_VECTOR_RASTER_SCALE = 2;

export const EXPORT_FORMAT_EXTENSION: Record<ExportFormat, string> = {
  [ExportFormat.jpeg]: 'jpg',
  [ExportFormat.pdf]: 'pdf',
  [ExportFormat.png]: 'png',
  [ExportFormat.svg]: 'svg',
};

export const EXPORT_FORMAT_MIME_TYPE: Record<ExportFormat, string> = {
  [ExportFormat.jpeg]: 'image/jpeg',
  [ExportFormat.pdf]: '',
  [ExportFormat.png]: 'image/png',
  [ExportFormat.svg]: '',
};

export const EXPORT_SCALE_MENU_OPTIONS: ExportScale[] = [
  ExportScale.half,
  ExportScale.threeQuarters,
  ExportScale.one,
  ExportScale.oneAndHalf,
  ExportScale.two,
  ExportScale.three,
  ExportScale.four,
  ExportScale.width512,
  ExportScale.height512,
];

export const EXPORT_FORMAT_MENU_OPTIONS: ExportFormat[] = [ExportFormat.png, ExportFormat.jpeg, ExportFormat.svg, ExportFormat.pdf];

export const EXPORT_COLOR_PROFILE_MENU_OPTIONS: ExportColorProfile[] = [
  ExportColorProfile.srgbSameAsFile,
  ExportColorProfile.srgb,
  ExportColorProfile.displayP3,
];

export const EXPORT_QUALITY_MENU_OPTIONS: ExportQuality[] = [ExportQuality.high, ExportQuality.medium, ExportQuality.low];

export const EXPORT_IMAGE_RESAMPLING_MENU_OPTIONS: ExportImageResampling[] = [ExportImageResampling.detailed, ExportImageResampling.basic];

export const DEFAULT_EXPORT_SETTING: TExportSetting = {
  colorProfile: ExportColorProfile.srgbSameAsFile,
  format: ExportFormat.png,
  ignoreOverlappingLayers: true,
  imageResampling: ExportImageResampling.detailed,
  includeBoundingBox: false,
  includeIdAttribute: false,
  outlineText: false,
  quality: ExportQuality.high,
  scale: ExportScale.one,
  suffix: '',
};

export const EMPTY_EXPORT_BOUNDS: TDraftRect = { height: 0, width: 0, x: 0, y: 0 };
