import { FC } from 'react';

// components
import BaseNodeIcon from './BaseNodeIcon/BaseNodeIcon';
import NodeShapeIcon from './NodeShapeIcon/NodeShapeIcon';

// hooks
import { useNodeOutlineState } from './hooks/useNodeOutlineState';

// styles
import styles from './layer-row-icon.module.scss';

// types
import { TSceneNode } from 'types/design/types';

// utils
import { getNodeTypeIconName } from './utils/getNodeTypeIconName';

export type TLayerRowIconProps = {
  isMask: boolean;
  node: TSceneNode;
  size?: number;
};

const LayerRowIcon: FC<TLayerRowIconProps> = ({ isMask, node, size = 12 }) => {
  const { isOutlinePending, outline } = useNodeOutlineState(node);

  if (outline && !isMask) {
    return <NodeShapeIcon outline={outline} size={size} />;
  }

  if (isOutlinePending && !isMask) {
    return (
      <span className={styles.LayerRowIcon__spinner}>
        <BaseNodeIcon name="Spinner" size={size} />
      </span>
    );
  }

  return <BaseNodeIcon name={getNodeTypeIconName(node, isMask)} size={size} />;
};

export default LayerRowIcon;
