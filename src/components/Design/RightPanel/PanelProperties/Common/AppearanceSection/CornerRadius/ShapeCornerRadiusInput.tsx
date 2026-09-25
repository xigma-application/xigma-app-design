import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import CornerRadiusInput from './CornerRadiusInput';

// hooks
import { useShapeCornerRadius } from './hooks/useShapeCornerRadius/useShapeCornerRadius';

// others
import { translationNameSpace } from '../constants';

// types
import { TShapeNodeType } from '../../types';

export type TShapeCornerRadiusInputProps = { type: TShapeNodeType };

const ShapeCornerRadiusInput: FC<TShapeCornerRadiusInputProps> = ({ type }) => {
  const { t } = useTranslation();
  const { isDisabled, onCommit, onScrub, value, valueLabel } = useShapeCornerRadius(type);

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

export default ShapeCornerRadiusInput;
