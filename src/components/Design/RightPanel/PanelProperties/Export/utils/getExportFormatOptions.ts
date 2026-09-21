// others
import { EXPORT_FORMAT_MENU_OPTIONS } from '../constants';

// types
import { ExportFormat } from '../enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

export const getExportFormatOptions = (getLabel: (format: ExportFormat) => string): TDropdownOption<ExportFormat>[] =>
  EXPORT_FORMAT_MENU_OPTIONS.map((format) => ({ label: getLabel(format), value: format }));
