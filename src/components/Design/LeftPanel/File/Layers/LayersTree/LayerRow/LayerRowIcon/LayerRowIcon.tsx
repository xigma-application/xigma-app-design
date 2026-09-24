import { FC, ReactNode } from 'react';

// components
import { Icon } from 'shared';
import BaseNodeIcon from './BaseNodeIcon/BaseNodeIcon';
import NodeShapeIcon from './NodeShapeIcon/NodeShapeIcon';

// hooks
import { useNodeOutlineState } from './hooks/useNodeOutlineState';

// styles
import styles from './layer-row-icon.module.scss';

// types
import { TSceneNode } from 'types/design/types';
import { TNodeOutline } from './types';

// utils
import { isBoxSceneNode } from 'components/Design/Canvas/utils/isBoxSceneNode';
import { getNodeTypeIconName } from './utils/getNodeTypeIconName';
import { hasNodeShapeOutline } from './utils/hasNodeShapeOutline';

export type TLayerRowIconProps = {
  isMask: boolean;
  isParentManagedLayout: boolean;
  node: TSceneNode;
  size?: number;
};

const getLayerRowIconContent = (
  node: TSceneNode,
  isMask: boolean,
  size: number,
  isOutlinePending: boolean,
  outline: TNodeOutline | null,
): ReactNode => {
  if (outline && !isMask) {
    return <NodeShapeIcon outline={outline} size={size} />;
  }

  if (isOutlinePending && !isMask && hasNodeShapeOutline(node)) {
    return (
      <span className={styles.LayerRowIcon__spinner}>
        <BaseNodeIcon name="Spinner" size={size} />
      </span>
    );
  }

  return <BaseNodeIcon name={getNodeTypeIconName(node, isMask)} size={size} />;
};

const LayerRowIcon: FC<TLayerRowIconProps> = ({ isMask, isParentManagedLayout, node, size = 12 }) => {
  const { isOutlinePending, outline } = useNodeOutlineState(node);

  return (
    <span className={styles.LayerRowIcon}>
      {getLayerRowIconContent(node, isMask, size, isOutlinePending, outline)}
      {isParentManagedLayout && isBoxSceneNode(node) && node.ignoreAutoLayout && (
        <span className={styles.LayerRowIcon__overlay}>
          <Icon name="Overlay" size={16} />
        </span>
      )}
    </span>
  );
};

export default LayerRowIcon;
