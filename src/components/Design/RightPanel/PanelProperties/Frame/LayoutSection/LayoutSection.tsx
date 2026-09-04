import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnClipContent from './ColumnClipContent/ColumnClipContent';
import ColumnDimensions from './ColumnDimensions/ColumnDimensions';
import ColumnFlow from './ColumnFlow/ColumnFlow';
import LayoutSectionButtons from './LayoutSectionButtons';
import { Section } from 'shared';

// others
import { translationNameSpace } from './constants';

const LayoutSection: FC = () => {
  const { t } = useTranslation();

  return (
    <Section component={<LayoutSectionButtons />} e2eValue="layout" label={t(`${translationNameSpace}.label`)}>
      <ColumnFlow />
      <ColumnDimensions />
      <ColumnClipContent />
    </Section>
  );
};

export default LayoutSection;
