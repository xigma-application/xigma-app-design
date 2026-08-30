import { FC, useRef } from 'react';

// components
import { Icon, TIconProps } from 'shared';

// hooks
import { useNormalizedIconStyle } from './hooks/useNormalizedIconStyle';

export type TBaseNodeIconProps = {
  className?: string;
  name: TIconProps['name'];
  size: number;
};

const BaseNodeIcon: FC<TBaseNodeIconProps> = ({ className, name, size }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const style = useNormalizedIconStyle(svgRef, name, size);

  return <Icon className={className} color="neutral2" name={name} ref={svgRef} size={size} style={style} />;
};

export default BaseNodeIcon;
