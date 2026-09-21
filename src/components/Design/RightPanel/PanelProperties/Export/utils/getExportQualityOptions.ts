// others
import { EXPORT_QUALITY_MENU_OPTIONS } from '../constants';

// types
import { ExportQuality } from '../enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getExportQualityOptions = (getLabel: (quality: ExportQuality) => string): TDropdownOption<ExportQuality>[] =>
  EXPORT_QUALITY_MENU_OPTIONS.map((quality) => ({ label: getLabel(quality), value: quality }));
