// store
import { selectSelectedFillIndices, selectSelectedNodes } from 'store/design/selectors';
import { setImageEditor, setSelectedFillIndices } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// utils
import { getCropTargetPaintIndex } from '../utils/getCropTargetPaintIndex';
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { seedImageCropIfNeeded } from 'components/Design/Canvas/utils/seedImageCropIfNeeded';

export const useHandleCropClick = (): TFunc => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const selectedFillIndices = useAppSelector(selectSelectedFillIndices);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;

  return (): void => {
    if (node) {
      const paintIndex = getCropTargetPaintIndex(node.fills, selectedFillIndices);

      if (paintIndex !== -1) {
        dispatch(setImageEditor({ mode: 'crop', nodeId: node.id, paintIndex }));
        dispatch(setSelectedFillIndices([paintIndex]));
        seedImageCropIfNeeded(dispatch, node, paintIndex);
      }
    }
  };
};
