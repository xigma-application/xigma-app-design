import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerRadiusInput from './CornerRadiusInput';

// hooks
import { useEllipseCornerRadius } from './hooks/useEllipseCornerRadius/useEllipseCornerRadius';

// others
import { translationNameSpace } from '../constants';

const EllipseCornerRadiusInput: FC = () => {
  const { t } = useTranslation();
  const { isDisabled, onCommit, onScrub, value, valueLabel } = useEllipseCornerRadius();

  return (
    <CornerRadiusInput
      ariaLabel={t(`${translationNameSpace}.cornerRadius.ariaLabel`)}
      disabled={isDisabled}
      e2eValue="corner-radius"
      iconName="Corners"
      onCommit={onCommit}
      onScrub={onScrub}
      scrubValue={value}
      tooltip={t(`${translationNameSpace}.cornerRadius.tooltip`)}
      value={valueLabel}
    />
  );
};

export default EllipseCornerRadiusInput;
