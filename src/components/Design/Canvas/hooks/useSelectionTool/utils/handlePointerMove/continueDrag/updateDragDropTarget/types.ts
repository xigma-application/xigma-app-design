// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export type TAutoLayoutFrame = TFrameNode & { layoutMode: LayoutMode.horizontal | LayoutMode.vertical };
