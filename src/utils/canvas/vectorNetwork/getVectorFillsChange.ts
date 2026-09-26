// types
import { TPaint } from 'types/design/paint/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getClosedLoopPaintFillData } from './convertShapeToVector/utils/getClosedLoopPaintFillData';

export type TVectorFillsChange = Partial<Pick<TVectorNode, 'defaultFill' | 'fillByKey' | 'filledFaceKeys' | 'holeParentByKey'>>;

export const getVectorFillsChange = (node: TVectorNode, fills: TPaint[]): TVectorFillsChange => {
  switch (true) {
    case fills.length === 0:
      return { defaultFill: [], fillByKey: {}, filledFaceKeys: [], holeParentByKey: {} };
    case node.filledFaceKeys.length === 0:
      return { defaultFill: fills, ...getClosedLoopPaintFillData(node, fills) };
    default:
      return {
        defaultFill: fills,
        fillByKey: { ...node.fillByKey, ...Object.fromEntries(node.filledFaceKeys.map((key) => [key, fills])) },
      };
  }
};
