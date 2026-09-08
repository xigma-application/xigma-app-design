import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnPaddingButtonIcons from './ColumnPaddingButtonIcons';
import PaddingFieldList from './PaddingFieldList';
import { UITools } from 'shared';

// hooks
import { useColumnPadding } from './hooks/useColumnPadding/useColumnPadding';

// others
import { translationNameSpace } from './constants';

const ColumnPadding: FC = () => {
  const { t } = useTranslation();
  const { individualFields, isIndividual, isVisible, mergedFields, toggleIndividual } = useColumnPadding();

  if (!isVisible) {
    return null;
  }

  return (
    <UITools.SectionColumn
      buttonsIcon={ColumnPaddingButtonIcons(isIndividual, toggleIndividual, t)}
      gridColumnType={UITools.GridColumnType.twoInputs}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
    >
      <PaddingFieldList fields={isIndividual ? individualFields : mergedFields} />
    </UITools.SectionColumn>
  );
};

export default ColumnPadding;
