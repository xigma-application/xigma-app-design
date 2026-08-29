import debounce from 'lodash/debounce';
import { FC, useEffect, useState } from 'react';

// components
import NodeShapeIcon from './NodeShapeIcon/NodeShapeIcon';
import { Icon } from 'shared';

// others
import { NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS, NODE_TYPE_ICON } from './constants';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeOutlinePath } from './utils/getNodeOutlinePath';

export type TTreeItemIconProps = {
  className?: string;
  node: TSceneNode;
  size: number;
};

const TreeItemIcon: FC<TTreeItemIconProps> = ({ className, node, size }) => {
  const [outline, setOutline] = useState(() => getNodeOutlinePath(node));

  useEffect(() => {
    const debouncedSetOutline = debounce(() => setOutline(getNodeOutlinePath(node)), NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS);
    debouncedSetOutline();

    return (): void => debouncedSetOutline.cancel();
  }, [node]);

  return outline ? (
    <NodeShapeIcon className={className} outline={outline} size={size} />
  ) : (
    <Icon className={className} color="neutral2" name={NODE_TYPE_ICON[node.type]} size={size} />
  );
};

export default TreeItemIcon;
