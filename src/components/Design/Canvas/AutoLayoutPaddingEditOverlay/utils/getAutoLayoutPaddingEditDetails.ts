// types
import { NodeType } from 'types/design/enums';
import { TAutoLayoutPaddingEditState, TAutoLayoutPaddingSide } from 'utils/canvas/autoLayoutPadding/types';
import { TIconProps } from 'shared';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getAutoLayoutPaddingIconName } from './getAutoLayoutPaddingIconName';
import { getAutoLayoutPaddingKey } from 'utils/canvas/autoLayoutPadding/getAutoLayoutPaddingKey';
import { worldToScreen } from '../../utils/worldToScreen';

export type TAutoLayoutPaddingEditDetails = {
  centerX: number;
  centerY: number;
  frameId: string;
  iconName: TIconProps['name'];
  initialValue: number;
  side: TAutoLayoutPaddingSide;
};

export const getAutoLayoutPaddingEditDetails = (
  editState: TAutoLayoutPaddingEditState | null,
  nodes: Record<string, TSceneNode>,
  viewport: TViewport,
): TAutoLayoutPaddingEditDetails | null => {
  if (editState) {
    const frame = nodes[editState.frameId];

    if (frame && frame.type === NodeType.frame) {
      const screen = worldToScreen(editState.point, viewport);

      return {
        centerX: screen.x,
        centerY: screen.y,
        frameId: editState.frameId,
        iconName: getAutoLayoutPaddingIconName(editState.side),
        initialValue: frame[getAutoLayoutPaddingKey(editState.side)] ?? 0,
        side: editState.side,
      };
    }
  }

  return null;
};
