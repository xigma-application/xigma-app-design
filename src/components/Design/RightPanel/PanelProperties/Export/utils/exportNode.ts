// types
import { TDraftRect } from 'types/canvas';
import { TExportFile, TExportSetting } from '../types';

// utils
import { createExportFile } from './createExportFile';
import { createExportZipBlob } from './createExportZipBlob';
import { downloadBlob } from 'utils/downloadBlob';
import { getExportFileNames } from './getExportFileNames';
import { getExportScaleFactor } from './getExportScaleFactor';
import { isRasterExportFormat } from './isRasterExportFormat';

export const exportNode = async (nodeId: string, nodeName: string, bounds: TDraftRect, settings: TExportSetting[]): Promise<void> => {
  const rasterSettings = settings.filter((setting) => isRasterExportFormat(setting.format));
  const fileNames = getExportFileNames(nodeName, rasterSettings);
  const renderedFiles = await Promise.all(
    rasterSettings.map((setting, index) =>
      createExportFile(
        nodeId,
        setting.format,
        getExportScaleFactor(setting.scale, bounds),
        fileNames[index],
        setting.ignoreOverlappingLayers,
        setting.imageResampling,
      ),
    ),
  );
  const files = renderedFiles.filter((file): file is TExportFile => file !== null);

  if (files.length === 1) {
    downloadBlob(files[0].blob, files[0].fileName);
  } else if (files.length > 1) {
    const zipBlob = await createExportZipBlob(files);

    downloadBlob(zipBlob, `${nodeName}.zip`);
  }
};
