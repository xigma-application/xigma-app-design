import cx from 'classnames';
import { CSSProperties, FC } from 'react';

// components
import PatternSourceButton from './PatternSourceButton/PatternSourceButton';

// hooks
import { usePatternThumbnail } from './hooks/usePatternThumbnail';

// styles
import styles from './pattern-source-preview.module.scss';

// types
import { TUsePatternSourcePickingResult } from '../../../hooks/usePatternSourcePicking';

export type TPatternSourcePreviewProps = { patternSourcePicking: TUsePatternSourcePickingResult; sourceNodeId?: string | null };

export const PatternSourcePreview: FC<TPatternSourcePreviewProps> = ({ patternSourcePicking, sourceNodeId }) => {
  const { isActive } = patternSourcePicking;
  const thumbnailUrl = usePatternThumbnail(sourceNodeId);
  const sourceButton = <PatternSourceButton patternSourcePicking={patternSourcePicking} />;

  return (
    <div
      className={cx(styles.PatternSourcePreview, { [styles['PatternSourcePreview--active']]: isActive })}
      style={thumbnailUrl ? ({ backgroundImage: `url("${thumbnailUrl}")` } as CSSProperties) : undefined}
    >
      {thumbnailUrl ? <div className={styles.PatternSourcePreview__overlay}>{sourceButton}</div> : sourceButton}
    </div>
  );
};

export default PatternSourcePreview;
