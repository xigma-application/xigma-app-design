import JSZip from 'jszip';

// types
import { TExportFile } from '../types';

export const createExportZipBlob = (files: TExportFile[]): Promise<Blob> => {
  const zip = new JSZip();
  files.forEach((file) => zip.file(file.fileName, file.blob));

  return zip.generateAsync({ type: 'blob' });
};
