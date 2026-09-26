// others
import { VIDEO_NODE_NAME } from '../constants';

// types
import { NodeType } from 'types/design/enums';
import { TArmedMedia } from './loadArmedMedia';
import { TDraftRect } from 'types/canvas';
import { TNewSceneNode } from 'types/design/types';

export const buildMediaRectangleNode = (rect: TDraftRect, media: TArmedMedia, name: string, parentId: string | null): TNewSceneNode => ({
  ...rect,
  fills: [{ opacity: 100, ref: media.src, rotation: 0, scaleMode: 'fill', type: media.kind }],
  name: media.kind === 'video' ? VIDEO_NODE_NAME : name,
  parentId,
  rotation: 0,
  type: NodeType.rectangle,
});
