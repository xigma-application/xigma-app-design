// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { TExportFile, TExportSetting } from '../types';

// utils
import { createExportFile } from './createExportFile';
import { getExportBounds } from './getExportBounds';
import { getExportFileNames } from './getExportFileNames';
import { getExportSourceId } from './getExportSourceId';
import { getExportScaleFactor } from './getExportScaleFactor';
import { isSupportedExportFormat } from './isSupportedExportFormat';

export const renderNodeExportFiles = async (
  nodeId: string | null,
  nodeName: string,
  settings: TExportSetting[],
): Promise<TExportFile[]> => {
  const state = store.getState();
  const nodesById = selectNodes(state);
  const { contentBounds, fullBounds } = getExportBounds(nodeId, nodesById, selectRootOrder(state));
  const sourceId = getExportSourceId(nodeId, nodesById);
  const supportedSettings = settings.filter((setting) => isSupportedExportFormat(setting.format));
  const fileNames = getExportFileNames(nodeName, supportedSettings);
  const renderedFiles: (TExportFile | null)[] = [];

  for (const [index, setting] of supportedSettings.entries()) {
    const bounds = setting.includeBoundingBox ? fullBounds : contentBounds;
    const file = await createExportFile(
      sourceId,
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

  return renderedFiles.filter((file): file is TExportFile => file !== null);
};
