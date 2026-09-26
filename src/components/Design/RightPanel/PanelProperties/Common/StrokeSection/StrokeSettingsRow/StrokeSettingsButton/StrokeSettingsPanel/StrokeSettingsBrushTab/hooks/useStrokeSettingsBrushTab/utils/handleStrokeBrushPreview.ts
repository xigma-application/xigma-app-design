import { RefObject } from 'react';

// types
import { TStrokeSettingsNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TApplyStrokeBrushChanges, TOriginalStrokeBrush } from '../types';
import { TStrokeBrushValues } from 'utils/design/stroke/getStrokeBrushValues';

export const handleStrokeBrushPreview = (
  nextBrush: string,
  originalBrushesRef: RefObject<TOriginalStrokeBrush[] | null>,
  nodes: TStrokeSettingsNode[],
  valuesList: TStrokeBrushValues[],
  update: TApplyStrokeBrushChanges,
): void => {
  originalBrushesRef.current ??= nodes.map((node, index) => ({ brush: valuesList[index].brush, id: node.id }));
  update({ strokeBrush: nextBrush });
};
