// types
import { ExportColorProfile } from '../enums';
import { TColorProfile } from 'types/canvas';

export const getColorProfileTarget = (colorProfile: ExportColorProfile): TColorProfile =>
  colorProfile === ExportColorProfile.displayP3 ? 'displayP3' : 'srgb';
