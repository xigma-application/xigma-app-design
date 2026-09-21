// types
import { ExportFormat } from '../enums';

export const isRasterExportFormat = (format: ExportFormat): boolean => format === ExportFormat.jpeg || format === ExportFormat.png;
