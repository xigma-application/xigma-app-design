// types
import { TAutoLayoutPadding } from './getAutoLayoutContentBox';
import { TFrameNode } from 'types/design/types';

export const getFramePadding = (frame: TFrameNode): TAutoLayoutPadding => ({
  paddingBottom: frame.paddingBottom ?? 0,
  paddingLeft: frame.paddingLeft ?? 0,
  paddingRight: frame.paddingRight ?? 0,
  paddingTop: frame.paddingTop ?? 0,
});
