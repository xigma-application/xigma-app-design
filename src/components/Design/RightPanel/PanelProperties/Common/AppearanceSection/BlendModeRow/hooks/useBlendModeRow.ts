// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BlendMode } from 'types/design/enums';
import { isAppearanceNode } from '../../types';

// utils
import { commitBlendModeChange } from '../../AppearanceHeaderButtons/BlendModeButton/hooks/utils/commitBlendModeChange';

export type TUseBlendModeRowResult = {
  isActive: boolean;
  onHover: TFunc<[BlendMode | null]>;
  onRemove: TFunc;
  onSelect: TFunc<[BlendMode]>;
  value: BlendMode;
};

export const useBlendModeRow = (): TUseBlendModeRowResult => {
  const dispatch = useAppDispatch();
  const { blendMode: blendModeRefs } = useCanvasRefsContext();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const node = isAppearanceNode(selectedNode) ? selectedNode : undefined;
  const id = node?.id ?? '';
  const value = node?.blendMode ?? BlendMode.passThrough;

  return {
    isActive: value !== BlendMode.passThrough,
    onHover: (blendMode): void => {
      blendModeRefs.previewRef.current = blendMode ? { blendMode, nodeId: id } : null;
    },
    onRemove: (): void => commitBlendModeChange(dispatch, id, BlendMode.passThrough),
    onSelect: (blendMode): void => commitBlendModeChange(dispatch, id, blendMode),
    value,
  };
};
