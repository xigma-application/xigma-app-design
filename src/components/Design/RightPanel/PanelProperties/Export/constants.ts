// others
import { translationNameSpace as parentNameSpace } from '../constants';

// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportScale } from './enums';
import { TExportSetting } from './types';

export const translationNameSpace = `${parentNameSpace}.export`;

export const EXPORT_PREVIEW_SIZE = 256;

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

export const EXPORT_IMAGE_RESAMPLING_MENU_OPTIONS: ExportImageResampling[] = [ExportImageResampling.detailed, ExportImageResampling.basic];

export const DEFAULT_EXPORT_SETTING: TExportSetting = {
  colorProfile: ExportColorProfile.srgbSameAsFile,
  format: ExportFormat.png,
  ignoreOverlappingLayers: true,
  imageResampling: ExportImageResampling.detailed,
  scale: ExportScale.one,
  suffix: '',
};
