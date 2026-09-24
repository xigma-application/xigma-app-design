// types
import { TExportSetting } from '../types';

// utils
import { exportNodes } from './exportNodes';

export const exportNode = (nodeId: string | null, nodeName: string, settings: TExportSetting[]): Promise<void> =>
  exportNodes([{ id: nodeId, name: nodeName }], settings, nodeName);
