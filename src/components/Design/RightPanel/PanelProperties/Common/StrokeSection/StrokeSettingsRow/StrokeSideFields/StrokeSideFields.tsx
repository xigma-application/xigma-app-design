import { FC, FocusEvent } from 'react';
import { useTranslation } from 'react-i18next';

// components
import StrokeWeightField from '../StrokeWeightField/StrokeWeightField';
// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';
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
  sideScrubValues: TStrokeSideWidths;
  sideWeights: Record<TStrokeSide, number | undefined>;
};

const StrokeSideFields: FC<TStrokeSideFieldsProps> = ({
  onDragEnd,
  onDragStart,
  onSideBlur,
  onSideScrub,
  sideScrubValues,
  sideWeights,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {SIDES.map((side) => (
        <StrokeWeightField
          ariaLabel={t(`${translationNameSpace}.sides.weightAriaLabel.${side}`)}
          displayValue={sideWeights[side] === undefined ? MIXED_LABEL : `${sideWeights[side]}`}
          e2eValue={`stroke-weight-${side}`}
          icon={getStrokeSidesIcon(StrokeSides[side])}
          key={side}
          onBlur={onSideBlur(side)}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onScrub={onSideScrub(side)}
          scrubValue={sideScrubValues[side]}
        />
      ))}
    </>
  );
};

export default StrokeSideFields;
