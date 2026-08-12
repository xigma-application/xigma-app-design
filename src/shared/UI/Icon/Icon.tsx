import { CSSProperties, FC, SVGProps, useMemo } from 'react';

// assets
import { Icons } from 'assets/svg';

// others
import { colors } from 'constant/colors';

// styles
import styles from './icon.module.scss';

export type TIconProps = Omit<SVGProps<SVGSVGElement>, 'color'> & {
  color?: keyof typeof colors;
  name: keyof typeof Icons;
  size?: number;
};

export const Icon: FC<TIconProps> = ({ color = 'neutral1', name, size = 16, style, ...restProps }) => {
  const SVG = useMemo(() => Icons[name], [name]);

  return (
    <SVG className={styles.Icon} height={size} style={{ color: colors[color], ...style } as CSSProperties} width={size} {...restProps} />
  );
};

export default Icon;
