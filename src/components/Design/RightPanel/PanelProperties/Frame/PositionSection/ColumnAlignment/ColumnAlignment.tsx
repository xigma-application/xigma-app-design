import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { ButtonGroup, GridColumnType, SectionColumn } from 'shared';

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
    <SectionColumn gridColumnType={GridColumnType.twoInputs} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <ButtonGroup buttons={buildAlignmentButtons(HORIZONTAL_ALIGNMENT_OPTIONS, disabled, t)} e2eValue="horizontal-alignment" />
      <ButtonGroup buttons={buildAlignmentButtons(VERTICAL_ALIGNMENT_OPTIONS, disabled, t)} e2eValue="vertical-alignment" />
    </SectionColumn>
  );
};

export default ColumnAlignment;
