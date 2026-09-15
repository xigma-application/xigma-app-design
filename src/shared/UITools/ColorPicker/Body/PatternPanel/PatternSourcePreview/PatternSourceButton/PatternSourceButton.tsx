import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// @xigma
import { Icon } from '@xigma/components';

// components
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../constants';

// types
import { TUsePatternSourcePickingResult } from '../../../../hooks/usePatternSourcePicking';

export type TPatternSourceButtonProps = { patternSourcePicking: TUsePatternSourcePickingResult };

export const PatternSourceButton: FC<TPatternSourceButtonProps> = ({ patternSourcePicking }) => {
  const { t } = useTranslation();
  const { close, isActive, open } = patternSourcePicking;

  return (
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
  );
};

export default PatternSourceButton;
