import { useCallback, useState } from 'react';

// store
import { selectImageEditor, selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';

export type TUseImageEditToolbarResult = {
  handleToggleSelectArea: () => void;
  isSelectAreaActive: boolean;
  isVisible: boolean;
};

export const useImageEditToolbar = (): TUseImageEditToolbarResult => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const [selectedNode] = selectedNodes;
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const imageEditor = useAppSelector(selectImageEditor);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const [isSelectAreaActive, setIsSelectAreaActive] = useState(false);

  const handleToggleSelectArea = useCallback((): void => {
    setIsSelectAreaActive((previous) => !previous);
  }, []);

  const isVisible =
    selectedNodes.length === 1 &&
    vectorEditingNodeIds.length === 0 &&
    imageEditor?.mode !== 'crop' &&
    imageEditor?.property !== 'strokes' &&
    (node?.fills.some((fill) => fill.type === 'image') ?? false);

  return { handleToggleSelectArea, isSelectAreaActive, isVisible };
};
