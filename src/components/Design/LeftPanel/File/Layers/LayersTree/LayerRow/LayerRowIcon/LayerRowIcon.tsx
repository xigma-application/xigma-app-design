import debounce from 'lodash/debounce';
import { FC, useEffect, useRef, useState } from 'react';

// components
import BaseNodeIcon from './BaseNodeIcon/BaseNodeIcon';
import NodeShapeIcon from './NodeShapeIcon/NodeShapeIcon';

// others
import { NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS } from './constants';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeOutlinePath } from './utils/getNodeOutlinePath';
import { getNodeTypeIconName } from './utils/getNodeTypeIconName';

export type TLayerRowIconProps = {
  isMask: boolean;
  node: TSceneNode;
  size?: number;
};

const LayerRowIcon: FC<TLayerRowIconProps> = ({ isMask, node, size = 12 }) => {
  const [outline, setOutline] = useState(() => getNodeOutlinePath(node));
  const previousNodeIdRef = useRef(node.id);

  useEffect(() => {
    const isSameNode = node.id === previousNodeIdRef.current;
    previousNodeIdRef.current = node.id;

    if (isSameNode) {
      const debouncedSetOutline = debounce(() => setOutline(getNodeOutlinePath(node)), NODE_SHAPE_ICON_REDRAW_DEBOUNCE_MS);
      debouncedSetOutline();

      return (): void => debouncedSetOutline.cancel();
    }

    setOutline(getNodeOutlinePath(node));
  }, [node]);

  return outline && !isMask ? (
    <NodeShapeIcon outline={outline} size={size} />
  ) : (
    <BaseNodeIcon name={getNodeTypeIconName(node, isMask)} size={size} />
  );
};

export default LayerRowIcon;
