// others
import { EXPORT_SCALE_MENU_OPTIONS } from '../constants';

// types
import { ExportScale } from '../enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getExportScaleOptions = (getLabel: (scale: ExportScale) => string): TDropdownOption<ExportScale>[] =>
  EXPORT_SCALE_MENU_OPTIONS.map((scale) => ({ label: getLabel(scale), value: scale }));
