// types
import { TExportFile } from '../types';

// utils
import { createExportZipBlob } from './createExportZipBlob';
import { downloadBlob } from 'utils/downloadBlob';

export const downloadExportFiles = async (files: TExportFile[], zipName: string): Promise<void> => {
  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].fileName);
  } else if (files.length > 1) {
    downloadBlob(await createExportZipBlob(files), `${zipName}.zip`);
  }
};
