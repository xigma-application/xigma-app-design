import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnAlignmentLayout from './ColumnAlignmentLayout/ColumnAlignmentLayout';
import ColumnClipContent from './ColumnClipContent/ColumnClipContent';
import ColumnDimensions from '../../Common/ColumnDimensions/ColumnDimensions';
import ColumnSpacing from '../../Common/ColumnSpacing/ColumnSpacing';
import ColumnFlow from './ColumnFlow/ColumnFlow';
import ColumnGridChildSpan from '../../Common/ColumnGridChildSpan/ColumnGridChildSpan';
import ColumnMinMaxDimensions from './ColumnMinMaxDimensions/ColumnMinMaxDimensions';
import ColumnPadding from './ColumnPadding/ColumnPadding';
import LayoutSectionButtons from './LayoutSectionButtons';
import { UITools } from 'shared';

// hooks
import { useIsMixedLayoutSelection } from './hooks/useIsMixedLayoutSelection';

// others
import { translationNameSpace } from './constants';

const LayoutSection: FC = () => {
  const { t } = useTranslation();
  const isMixedLayout = useIsMixedLayoutSelection();

  return (
    <UITools.Section component={<LayoutSectionButtons />} e2eValue="layout" label={t(`${translationNameSpace}.label`)}>
      <ColumnFlow />
      <ColumnDimensions />
      <ColumnSpacing />
      <ColumnGridChildSpan />
      <ColumnMinMaxDimensions />
      {!isMixedLayout && <ColumnAlignmentLayout />}
      {!isMixedLayout && <ColumnPadding />}
      <ColumnClipContent />
    </UITools.Section>
  );
};

export default LayoutSection;
