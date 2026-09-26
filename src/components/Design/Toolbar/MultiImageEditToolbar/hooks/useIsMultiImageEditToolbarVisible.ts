// store
import { selectImageEditor, selectSelectedNodes, selectVectorEditingNodeIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { isMultiImageSelection } from '../utils/isMultiImageSelection';

export const useIsMultiImageEditToolbarVisible = (): boolean => {
  const selectedNodes = useAppSelector(selectSelectedNodes);
  const vectorEditingNodeIds = useAppSelector(selectVectorEditingNodeIds);
  const imageEditor = useAppSelector(selectImageEditor);

  return vectorEditingNodeIds.length === 0 && !imageEditor && isMultiImageSelection(selectedNodes);
};
