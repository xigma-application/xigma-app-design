// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportQuality, ExportScale } from './enums';

export type TExportSetting = {
  colorProfile: ExportColorProfile;
  format: ExportFormat;
  ignoreOverlappingLayers: boolean;
  imageResampling: ExportImageResampling;
  quality: ExportQuality;
  scale: ExportScale;
  suffix: string;
};

export type TExportFile = { blob: Blob; fileName: string };
