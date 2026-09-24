// types
import { LayoutMode } from 'types/design/enums';
import { TFrameNode } from 'types/design/types';

export const getLayoutKey = (frame: TFrameNode): string => `${frame.layoutMode ?? LayoutMode.freeForm}:${Boolean(frame.layoutWrap)}`;
