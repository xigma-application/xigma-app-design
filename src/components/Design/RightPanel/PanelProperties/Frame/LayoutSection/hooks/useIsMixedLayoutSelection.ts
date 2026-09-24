// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// types
import { LayoutMode, NodeType } from 'types/design/enums';
import { TFrameNode, TSceneNode } from 'types/design/types';

const isFrameNode = (node: TSceneNode | undefined): node is TFrameNode => node?.type === NodeType.frame;

const getLayoutKey = (frame: TFrameNode): string => `${frame.layoutMode ?? LayoutMode.freeForm}:${Boolean(frame.layoutWrap)}`;

export const useIsMixedLayoutSelection = (): boolean => {
  const frames = useAppSelector(selectSelectedNodes).filter(isFrameNode);
  return frames.some((frame) => getLayoutKey(frame) !== getLayoutKey(frames[0]));
};
