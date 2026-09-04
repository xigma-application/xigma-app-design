import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnFlowButtonIcons from './ColumnFlowButtonIcons';
import { UITools } from 'shared';

// hooks
import { useColumnFlow } from './hooks/useColumnFlow';

// others
import { translationNameSpace } from './constants';

const ColumnFlow: FC = () => {
  const { t } = useTranslation();
  const { onChange, onWrapChange, toggleButtons, value, wrap } = useColumnFlow();

  return (
    <UITools.SectionColumn
      buttonsIcon={ColumnFlowButtonIcons(value, wrap, onWrapChange, t)}
      gridColumnType={UITools.GridColumnType.single}
      labels={[t(`${translationNameSpace}.label`)]}
      withBottomMargin
    >
      <UITools.ToggleButtonGroup e2eValue="flow" onChange={onChange} toggleButtons={toggleButtons} value={value} />
    </UITools.SectionColumn>
  );
};

export default ColumnFlow;
