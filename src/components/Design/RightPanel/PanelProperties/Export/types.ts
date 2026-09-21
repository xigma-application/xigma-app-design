// types
import { ExportColorProfile, ExportFormat, ExportImageResampling, ExportScale } from './enums';

export type TExportSetting = {
  colorProfile: ExportColorProfile;
  format: ExportFormat;
  ignoreOverlappingLayers: boolean;
  imageResampling: ExportImageResampling;
  scale: ExportScale;
  suffix: string;
};
