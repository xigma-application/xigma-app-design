// store
import { selectSelectedNodes } from 'store/design/selectors';
import { toggleFrameClipContent } from 'store/design/slice';
import { useAppDispatch, useAppSelector } from 'store';

// types
import { NodeType } from 'types/design/enums';

export type TUseColumnClipContentResult = {
  clipContent: boolean;
  onChange: TFunc;
};

export const useColumnClipContent = (): TUseColumnClipContentResult => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useAppSelector(selectSelectedNodes);
  const frameNode = selectedNode?.type === NodeType.frame ? selectedNode : undefined;
  const id = frameNode?.id ?? '';
  const clipContent = frameNode?.clipContent ?? false;

  return {
    clipContent,
    onChange: () => dispatch(toggleFrameClipContent(id)),
  };
};
