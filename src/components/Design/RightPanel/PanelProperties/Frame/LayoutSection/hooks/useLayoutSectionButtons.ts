// hooks
import { useResizeToFitSelection } from 'components/Design/Menu/hooks/useResizeToFitSelection';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { updateNode } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';

// utils
import { isFreeformFrame } from 'utils/canvas/signals/isFreeformFrame';

export type TUseLayoutSectionButtonsResult = {
  isAutoLayoutSelected: boolean;
  isResizeToFitVisible: boolean;
  onResizeToFit: TFunc;
  onToggleAutoLayout: TFunc;
};

export const useLayoutSectionButtons = (): TUseLayoutSectionButtonsResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const onResizeToFit = useResizeToFitSelection();
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const isFreeform = !frameNode || isFreeformFrame(frameNode);

  return {
    isAutoLayoutSelected: !isFreeform,
    isResizeToFitVisible: isFreeform,
    onResizeToFit,
    onToggleAutoLayout: (): void => {
      if (frameNode) {
        dispatch(updateNode({ changes: { layoutMode: isFreeform ? LayoutMode.horizontal : LayoutMode.freeForm }, id: frameNode.id }));
      }
    },
  };
};
