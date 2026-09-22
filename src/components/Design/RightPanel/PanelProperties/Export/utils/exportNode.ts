// store
import { selectNodes, selectRootOrder } from 'store/design/selectors';
import { store } from 'store';

// types
import { TDraftRect } from 'types/canvas';
import { TExportFile, TExportSetting } from '../types';
import { TSceneNode } from 'types/design/types';

// utils
import { createExportFile } from './createExportFile';
import { createExportZipBlob } from './createExportZipBlob';
import { downloadBlob } from 'utils/downloadBlob';
import { getExportContentBounds } from 'utils/canvas/getExportContentBounds';
import { getExportFileNames } from './getExportFileNames';
import { getExportScaleFactor } from './getExportScaleFactor';
import { getPageExportBounds } from 'utils/canvas/getPageExportBounds';
import { getRotatedNodeBounds } from 'components/Design/Canvas/utils/getRotatedNodeBounds';
import { isSupportedExportFormat } from './isSupportedExportFormat';

const EMPTY_BOUNDS: TDraftRect = { height: 0, width: 0, x: 0, y: 0 };

const getExportBounds = (
  nodeId: string | null,
  nodesById: Record<string, TSceneNode>,
  rootOrder: string[],
): { contentBounds: TDraftRect; fullBounds: TDraftRect } => {
  if (nodeId === null) {
    const pageBounds = getPageExportBounds(rootOrder, nodesById) ?? EMPTY_BOUNDS;
    return { contentBounds: pageBounds, fullBounds: pageBounds };
  }

  const node = nodesById[nodeId];

  return {
    contentBounds: getExportContentBounds(nodeId, nodesById),
    fullBounds: node ? getRotatedNodeBounds(node) : EMPTY_BOUNDS,
  };
};

export const exportNode = async (nodeId: string | null, nodeName: string, settings: TExportSetting[]): Promise<void> => {
  const state = store.getState();
  const nodesById = selectNodes(state);
  const { contentBounds, fullBounds } = getExportBounds(nodeId, nodesById, selectRootOrder(state));
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
