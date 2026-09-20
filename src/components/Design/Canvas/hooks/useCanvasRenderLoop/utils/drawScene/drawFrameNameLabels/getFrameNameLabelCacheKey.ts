// types
import { TFrameNode } from 'types/design/types';

export const getFrameNameLabelCacheKey = (node: TFrameNode, zoom: number): string => JSON.stringify([node, zoom]);
