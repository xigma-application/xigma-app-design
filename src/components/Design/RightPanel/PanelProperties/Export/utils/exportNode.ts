// types
import { TDraftRect } from 'types/canvas';
import { TExportFile, TExportSetting } from '../types';

// utils
import { createExportFile } from './createExportFile';
import { createExportZipBlob } from './createExportZipBlob';
import { downloadBlob } from 'utils/downloadBlob';
import { getExportFileNames } from './getExportFileNames';
import { getExportScaleFactor } from './getExportScaleFactor';
import { isSupportedExportFormat } from './isSupportedExportFormat';

export const exportNode = async (nodeId: string, nodeName: string, bounds: TDraftRect, settings: TExportSetting[]): Promise<void> => {
  const supportedSettings = settings.filter((setting) => isSupportedExportFormat(setting.format));
  const fileNames = getExportFileNames(nodeName, supportedSettings);
  const renderedFiles: (TExportFile | null)[] = [];

  for (const [index, setting] of supportedSettings.entries()) {
    const file = await createExportFile(
      nodeId,
      setting.format,
      getExportScaleFactor(setting.scale, bounds),
      fileNames[index],
      setting.ignoreOverlappingLayers,
      setting.imageResampling,
      setting.colorProfile,
      setting.quality,
    );

    renderedFiles.push(file);
  }

  const files = renderedFiles.filter((file): file is TExportFile => file !== null);

  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].fileName);
  } else if (files.length > 1) {
    const zipBlob = await createExportZipBlob(files);

    downloadBlob(zipBlob, `${nodeName}.zip`);
  }
};
