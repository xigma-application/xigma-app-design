import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeWeightField from '../StrokeWeightField/StrokeWeightField';
// others
import { getStrokeSidesIcon } from '../utils/getStrokeSidesIcon';
import { translationNameSpace } from '../../constants';

// types
import { StrokeSides } from 'types/design/enums';
import { TStrokeSide, TStrokeSideWidths } from 'utils/design/stroke/types';

const SIDES: TStrokeSide[] = ['left', 'top', 'right', 'bottom'];

export type TStrokeSideFieldsProps = {
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onSideBlur: (side: TStrokeSide) => TFunc<[FocusEvent<HTMLInputElement>]>;
  onSideScrub: (side: TStrokeSide) => TFunc<[number]>;
  sideWeights: TStrokeSideWidths;
};

const StrokeSideFields: FC<TStrokeSideFieldsProps> = ({ onDragEnd, onDragStart, onSideBlur, onSideScrub, sideWeights }) => {
  const { t } = useTranslation();

  return (
    <>
      {SIDES.map((side) => (
        <StrokeWeightField
          ariaLabel={t(`${translationNameSpace}.sides.weightAriaLabel.${side}`)}
          displayValue={`${sideWeights[side]}`}
          e2eValue={`stroke-weight-${side}`}
          icon={getStrokeSidesIcon(StrokeSides[side])}
          key={side}
          onBlur={onSideBlur(side)}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onScrub={onSideScrub(side)}
          scrubValue={sideWeights[side]}
        />
      ))}
    </>
  );
};

export default StrokeSideFields;
