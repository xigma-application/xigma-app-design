import { useState } from 'react';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TUseColumnPaddingResult } from './types';

// utils
import { pairField } from './utils/pairField';
import { sideField } from './utils/sideField';
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

export const useColumnPadding = (): TUseColumnPaddingResult => {
  const dispatch = useAppDispatch();
  const { hover } = useCanvasRefsContext();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const [isIndividual, setIsIndividual] = useState(false);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const left = frameNode?.paddingLeft ?? 0;
  const top = frameNode?.paddingTop ?? 0;
  const right = frameNode?.paddingRight ?? 0;
  const bottom = frameNode?.paddingBottom ?? 0;

  return {
    individualFields: [
      sideField(dispatch, id, 'left', 'padding-left', 'PaddingL', 'paddingLeft', left, hover.rightPanelPaddingGuideRef, 'left'),
      sideField(dispatch, id, 'top', 'padding-top', 'PaddingT', 'paddingTop', top, hover.rightPanelPaddingGuideRef, 'top'),
      sideField(dispatch, id, 'right', 'padding-right', 'PaddingR', 'paddingRight', right, hover.rightPanelPaddingGuideRef, 'right'),
      sideField(dispatch, id, 'bottom', 'padding-bottom', 'PaddingB', 'paddingBottom', bottom, hover.rightPanelPaddingGuideRef, 'bottom'),
    ],
    isIndividual,
    isVisible:
      frameNode?.layoutMode === LayoutMode.horizontal ||
      frameNode?.layoutMode === LayoutMode.vertical ||
      frameNode?.layoutMode === LayoutMode.grid,
    mergedFields: [
      pairField(
        dispatch,
        id,
        'horizontal',
        'padding-horizontal',
        'PaddingLR',
        'paddingLeft',
        left,
        'paddingRight',
        right,
        hover.rightPanelPaddingGuideRef,
        ['left', 'right'],
      ),
      pairField(
        dispatch,
        id,
        'vertical',
        'padding-vertical',
        'PaddingTB',
        'paddingTop',
        top,
        'paddingBottom',
        bottom,
        hover.rightPanelPaddingGuideRef,
        ['top', 'bottom'],
      ),
    ],
    toggleIndividual: () => setIsIndividual((previous) => !previous),
  };
};
