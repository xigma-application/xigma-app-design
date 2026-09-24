import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import BooleanHeader from './BooleanHeader/BooleanHeader';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnSpacing from '../Common/ColumnSpacing/ColumnSpacing';
import EffectsSection from '../Common/EffectsSection/EffectsSection';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import PositionSection from '../Common/PositionSection/PositionSection';
import StrokeSection from '../Common/StrokeSection/StrokeSection';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

const BooleanPanel: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <BooleanHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions />
        <ColumnSpacing />
      </UITools.Section>
      <AppearanceSection withCornerRadius={false} />
      <FillSection />
      <StrokeSection />
      <EffectsSection />
      <Export />
    </Fragment>
  );
};

export default BooleanPanel;
