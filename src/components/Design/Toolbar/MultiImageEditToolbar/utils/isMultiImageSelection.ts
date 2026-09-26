// types
import { isAppearanceNode } from 'components/Design/RightPanel/PanelProperties/Common/AppearanceSection/types';
import { TSceneNode } from 'types/design/types';

const hasOnlyImageMedia = (node: TSceneNode): boolean =>
  isAppearanceNode(node) && node.fills.some((fill) => fill.type === 'image') && !node.fills.some((fill) => fill.type === 'video');

export const isMultiImageSelection = (nodes: TSceneNode[]): boolean => nodes.length > 1 && nodes.every(hasOnlyImageMedia);
