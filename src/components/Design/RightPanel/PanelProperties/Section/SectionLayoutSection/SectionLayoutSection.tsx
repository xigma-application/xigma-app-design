import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensions from '../../Common/ColumnDimensions/ColumnDimensions';
import ColumnSpacing from '../../Common/ColumnSpacing/ColumnSpacing';
import ResizeToFitButton from '../../Common/ResizeToFitButton/ResizeToFitButton';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../../Common/constants';

const SectionLayoutSection: FC = () => {
  const { t } = useTranslation();

  return (
    <UITools.Section component={<ResizeToFitButton />} e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
      <ColumnDimensions />
      <ColumnSpacing />
    </UITools.Section>
  );
};

export default SectionLayoutSection;
