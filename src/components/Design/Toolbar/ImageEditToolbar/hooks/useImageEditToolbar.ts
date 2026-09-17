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
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const imageEditor = useAppSelector(selectImageEditor);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const [isSelectAreaActive, setIsSelectAreaActive] = useState(false);

  const handleToggleSelectArea = useCallback((): void => {
    setIsSelectAreaActive((previous) => !previous);
  }, []);

  const isVisible =
    vectorEditingNodeIds.length === 0 && imageEditor?.mode !== 'crop' && (node?.fills.some((fill) => fill.type === 'image') ?? false);

  return { handleToggleSelectArea, isSelectAreaActive, isVisible };
};
