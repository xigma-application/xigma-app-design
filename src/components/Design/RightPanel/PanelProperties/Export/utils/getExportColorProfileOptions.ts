// others
import { EXPORT_COLOR_PROFILE_MENU_OPTIONS } from '../constants';

// types
import { ExportColorProfile } from '../enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getExportColorProfileOptions = (
  getLabel: (colorProfile: ExportColorProfile) => string,
): TDropdownOption<ExportColorProfile>[] =>
  EXPORT_COLOR_PROFILE_MENU_OPTIONS.map((colorProfile) => ({ label: getLabel(colorProfile), value: colorProfile }));
