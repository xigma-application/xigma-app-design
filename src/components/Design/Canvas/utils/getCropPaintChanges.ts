// types
import { TImageFrameNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TPaint } from 'types/design/paint/types';

export const getCropPaintChanges = (
  node: TImageFrameNode,
  transform: (paints: TPaint[]) => TPaint[] | undefined,
): { fills?: TPaint[]; strokes?: TPaint[] } => {
  const fills = transform(node.fills);
  const strokes = node.strokes ? transform(node.strokes) : undefined;

  return { ...(fills ? { fills } : {}), ...(strokes ? { strokes } : {}) };
};
