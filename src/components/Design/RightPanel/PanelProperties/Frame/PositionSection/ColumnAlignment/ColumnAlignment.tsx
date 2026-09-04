import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { UITools } from 'shared';

// others
import { HORIZONTAL_ALIGNMENT_OPTIONS, translationNameSpace, VERTICAL_ALIGNMENT_OPTIONS } from './constants';

// store
import { selectSelectedNodes } from 'store/design/selectors';
import { useAppSelector } from 'store';

// utils
import { buildAlignmentButtons } from './utils/buildAlignmentButtons';

const ColumnAlignment: FC = () => {
  const { t } = useTranslation();
  const [frameNode] = useAppSelector(selectSelectedNodes);
  const disabled = !frameNode?.parentId;

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <UITools.ButtonGroup buttons={buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, disabled, t)} e2eValue="horizontal-alignment" />
      <UITools.ButtonGroup buttons={buildAlignmentButtons(VERTICAL_ALIGNMENT_OPTIONS, disabled, t)} e2eValue="vertical-alignment" />
    </UITools.SectionColumn>
  );
};

export default ColumnAlignment;
