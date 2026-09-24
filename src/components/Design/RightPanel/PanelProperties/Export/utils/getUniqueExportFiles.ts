// types
import { TExportFile } from '../types';

export const getUniqueExportFiles = (files: TExportFile[]): TExportFile[] => {
  const occurrenceCounts = new Map<string, number>();

  return files.map((file) => {
    const occurrenceCount = occurrenceCounts.get(file.fileName) ?? 0;
    const extensionIndex = file.fileName.lastIndexOf('.');

    occurrenceCounts.set(file.fileName, occurrenceCount + 1);

    return occurrenceCount === 0
      ? file
      : { ...file, fileName: `${file.fileName.slice(0, extensionIndex)} (${occurrenceCount + 1})${file.fileName.slice(extensionIndex)}` };
  });
};
