// others
import { EXPORT_IMAGE_RESAMPLING_MENU_OPTIONS } from '../constants';

// types
import { ExportImageResampling } from '../enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getExportImageResamplingOptions = (
  getLabel: (imageResampling: ExportImageResampling) => string,
): TDropdownOption<ExportImageResampling>[] =>
  EXPORT_IMAGE_RESAMPLING_MENU_OPTIONS.map((imageResampling) => ({ label: getLabel(imageResampling), value: imageResampling }));
