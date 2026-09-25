import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnGridChildSpan from '../Common/ColumnGridChildSpan/ColumnGridChildSpan';
import ColumnSpacing from '../Common/ColumnSpacing/ColumnSpacing';
import EffectsSection from '../Common/EffectsSection/EffectsSection';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import LineHeader from './LineHeader/LineHeader';
import LineStrokeSettings from './LineStrokeSettings/LineStrokeSettings';
import PositionSection from '../Common/PositionSection/PositionSection';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

const Line: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <LineHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions isHeightDisabled />
        <ColumnSpacing />
        <ColumnGridChildSpan />
      </UITools.Section>
      <AppearanceSection withCornerRadius={false} />
      <FillSection footer={<LineStrokeSettings />} property="strokes" />
      <EffectsSection />
      <Export />
    </Fragment>
  );
};

export default Line;
