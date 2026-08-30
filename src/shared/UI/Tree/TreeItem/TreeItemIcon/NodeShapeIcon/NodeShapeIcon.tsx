import { FC } from 'react';

// others
import { colors } from 'constant/colors';
import { NODE_SHAPE_ICON_STROKE_WIDTH, NODE_SHAPE_ICON_VIEW_BOX_SIZE } from '../constants';

// types
import { TNodeOutline } from '../types';

export type TNodeShapeIconProps = {
  className?: string;
  outline: TNodeOutline;
  size: number;
};

const NodeShapeIcon: FC<TNodeShapeIconProps> = ({ className = '', outline, size }) => (
  <svg
    className={className}
    height={size}
    style={{ color: colors.neutral2 }}
    viewBox={`0 0 ${NODE_SHAPE_ICON_VIEW_BOX_SIZE} ${NODE_SHAPE_ICON_VIEW_BOX_SIZE}`}
    width={size}
  >
    <path
      d={outline.d}
      data-svg-property="stroke"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={NODE_SHAPE_ICON_STROKE_WIDTH}
    />
  </svg>
);

export default NodeShapeIcon;
