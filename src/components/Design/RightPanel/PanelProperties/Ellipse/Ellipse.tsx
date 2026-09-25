import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnGridChildSpan from '../Common/ColumnGridChildSpan/ColumnGridChildSpan';
import ColumnSpacing from '../Common/ColumnSpacing/ColumnSpacing';
import EffectsSection from '../Common/EffectsSection/EffectsSection';
import EllipseHeader from './EllipseHeader/EllipseHeader';
import EllipseStrokeSettings from './EllipseStrokeSettings/EllipseStrokeSettings';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import PositionSection from '../Common/PositionSection/PositionSection';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

const Ellipse: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <EllipseHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions />
        <ColumnSpacing />
        <ColumnGridChildSpan />
      </UITools.Section>
      <AppearanceSection withArc withCornerRadius={false} withEllipseCornerRadius />
      <FillSection />
      <FillSection footer={<EllipseStrokeSettings />} property="strokes" />
      <EffectsSection />
      <Export />
    </Fragment>
  );
};

export default Ellipse;
