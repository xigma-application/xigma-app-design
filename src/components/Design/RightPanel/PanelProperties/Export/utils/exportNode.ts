// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TExportFile, TExportSetting } from '../types';

// utils
import { createExportFile } from './createExportFile';
import { createExportZipBlob } from './createExportZipBlob';
import { downloadBlob } from 'utils/downloadBlob';
import { getExportContentBounds } from './getExportContentBounds';
import { getExportFileNames } from './getExportFileNames';
import { getExportScaleFactor } from './getExportScaleFactor';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSupportedExportFormat } from './isSupportedExportFormat';

export const exportNode = async (nodeId: string, nodeName: string, settings: TExportSetting[]): Promise<void> => {
  const nodesById = selectNodes(store.getState());
  const node = nodesById[nodeId];
  const fullBounds = node ? getRotatedNodeBounds(node) : { height: 0, width: 0, x: 0, y: 0 };
  const contentBounds = getExportContentBounds(nodeId, nodesById);
  const supportedSettings = settings.filter((setting) => isSupportedExportFormat(setting.format));
  const fileNames = getExportFileNames(nodeName, supportedSettings);
  const renderedFiles: (TExportFile | null)[] = [];

  for (const [index, setting] of supportedSettings.entries()) {
    const bounds = setting.includeBoundingBox ? fullBounds : contentBounds;
    const file = await createExportFile(
      nodeId,
      setting.format,
      getExportScaleFactor(setting.scale, bounds),
      fileNames[index],
      setting.ignoreOverlappingLayers,
      setting.imageResampling,
      setting.colorProfile,
      setting.quality,
      bounds,
      setting.outlineText,
      setting.includeIdAttribute,
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
