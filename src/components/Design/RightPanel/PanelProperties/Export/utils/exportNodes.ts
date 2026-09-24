// types
import { TExportSetting, TExportTarget } from '../types';

// utils
import { downloadExportFiles } from './downloadExportFiles';
import { getUniqueExportFiles } from './getUniqueExportFiles';
import { renderNodeExportFiles } from './renderNodeExportFiles';

export const exportNodes = async (targets: TExportTarget[], settings: TExportSetting[], zipName: string): Promise<void> => {
  const files = [];

  for (const target of targets) {
    files.push(...(await renderNodeExportFiles(target.id, target.name, settings)));
  }

  await downloadExportFiles(getUniqueExportFiles(files), zipName);
};
