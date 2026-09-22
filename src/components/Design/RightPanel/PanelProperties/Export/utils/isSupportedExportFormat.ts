// types
import { ExportFormat } from '../enums';

export const isSupportedExportFormat = (format: ExportFormat): boolean =>
  format === ExportFormat.jpeg || format === ExportFormat.pdf || format === ExportFormat.png || format === ExportFormat.svg;
