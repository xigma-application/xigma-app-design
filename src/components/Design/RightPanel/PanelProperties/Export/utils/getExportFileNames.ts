// others
import { EXPORT_FORMAT_EXTENSION } from '../constants';

// types
import { TExportSetting } from '../types';

export const getExportFileNames = (nodeName: string, settings: TExportSetting[]): string[] => {
  const occurrenceCounts = new Map<string, number>();

  return settings.map((setting) => {
    const baseName = `${nodeName}${setting.suffix}`;
    const extension = EXPORT_FORMAT_EXTENSION[setting.format];
    const fileName = `${baseName}.${extension}`;
    const occurrenceCount = occurrenceCounts.get(fileName) ?? 0;

    occurrenceCounts.set(fileName, occurrenceCount + 1);

    return occurrenceCount === 0 ? fileName : `${baseName} (${occurrenceCount + 1}).${extension}`;
  });
};
