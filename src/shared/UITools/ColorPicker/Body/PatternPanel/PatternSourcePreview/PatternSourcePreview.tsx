import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../constants';

// styles
import styles from './pattern-source-preview.module.scss';

// types
import { TUsePatternSourcePickingResult } from '../../../hooks/usePatternSourcePicking';

export type TPatternSourcePreviewProps = { patternSourcePicking: TUsePatternSourcePickingResult };

export const PatternSourcePreview: FC<TPatternSourcePreviewProps> = ({ patternSourcePicking }) => {
  const { t } = useTranslation();
  const { close, isActive, open } = patternSourcePicking;

  return (
    <div className={styles.PatternSourcePreview}>
      <UITools.Button
        active={isActive}
        color={isActive ? 'primary' : 'secondary'}
        onClick={isActive ? close : open}
        size="small"
        variant={isActive ? 'solid' : 'outline'}
      >
        <Icon name="Source" size={24} />
        {t(`${translationNameSpace}.selectSourceLabel`)}
      </UITools.Button>
    </div>
  );
};

export default PatternSourcePreview;
