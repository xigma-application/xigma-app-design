import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnFlowButtonIcons from './ColumnFlowButtonIcons';
import { GridColumnType, SectionColumn, ToggleButtonGroup } from 'shared';

// hooks
import { useColumnFlow } from './hooks/useColumnFlow';

// others
import { translationNameSpace } from './constants';

const ColumnFlow: FC = () => {
  const { t } = useTranslation();
  const { onChange, onWrapChange, toggleButtons, value, wrap } = useColumnFlow();

  return (
    <SectionColumn
      buttonsIcon={ColumnFlowButtonIcons(value, wrap, onWrapChange, t)}
      gridColumnType={GridColumnType.single}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
    >
      <ToggleButtonGroup e2eValue="flow" onChange={onChange} toggleButtons={toggleButtons} value={value} />
    </SectionColumn>
  );
};

export default ColumnFlow;
