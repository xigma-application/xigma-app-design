// core
import { useCanvasRefsContext } from 'components/App/core/CanvasRefsProvider/hooks/useCanvasRefsContext';

// store
import { selectAppearanceNodes } from 'store/design/selectors';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { BlendMode } from 'types/design/enums';

// utils
import { isStyledOrVectorNode } from '../../utils/isStyledOrVectorNode';
import { commitBlendModeToNodes } from '../../AppearanceHeaderButtons/BlendModeButton/hooks/utils/commitBlendModeToNodes';
import { getSharedBlendMode } from '../../AppearanceHeaderButtons/BlendModeButton/hooks/utils/getSharedBlendMode';

export type TUseBlendModeRowResult = {
  isActive: boolean;
  onHover: TFunc<[BlendMode | null]>;
  onRemove: TFunc;
  onSelect: TFunc<[BlendMode]>;
  value: BlendMode | undefined;
};

export const useBlendModeRow = (): TUseBlendModeRowResult => {
  const dispatch = useAppDispatch();
  const { blendMode: blendModeRefs } = useCanvasRefsContext();
  const nodes = useAppSelector(selectAppearanceNodes).filter(isStyledOrVectorNode);
  const nodeIds = nodes.map((node) => node.id);
  const value = getSharedBlendMode(nodes);

  return {
    isActive: nodes.length > 0 && value !== BlendMode.passThrough,
    onHover: (blendMode): void => {
      blendModeRefs.previewRef.current = blendMode ? { blendMode, nodeIds } : null;
    },
    onRemove: (): void => commitBlendModeToNodes(dispatch, nodes, BlendMode.passThrough),
    onSelect: (blendMode): void => commitBlendModeToNodes(dispatch, nodes, blendMode),
    value,
  };
};
