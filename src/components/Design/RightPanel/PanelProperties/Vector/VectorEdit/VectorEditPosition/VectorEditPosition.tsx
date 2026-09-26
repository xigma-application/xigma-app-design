import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { noop } from 'lodash';

// components
import ColumnPositionField from '../../../Common/PositionSection/ColumnPosition/ColumnPositionField/ColumnPositionField';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../../Common/PositionSection/ColumnPosition/constants';

const VectorEditPosition: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <ColumnPositionField
        ariaLabel={t(`${translationNameSpace}.ariaLabelX`)}
        disabled
        displayValue=""
        e2eValue="x"
        label="X"
        onBlur={noop}
        onDragEnd={noop}
        onDragStart={noop}
        onScrub={noop}
        tooltip={t(`${translationNameSpace}.tooltipX`)}
        value={0}
      />
      <ColumnPositionField
        ariaLabel={t(`${translationNameSpace}.ariaLabelY`)}
        disabled
        displayValue=""
        e2eValue="y"
        label="Y"
        onBlur={noop}
        onDragEnd={noop}
        onDragStart={noop}
        onScrub={noop}
        tooltip={t(`${translationNameSpace}.tooltipY`)}
        value={0}
      />
    </UITools.SectionColumn>
  );
};

export default VectorEditPosition;
