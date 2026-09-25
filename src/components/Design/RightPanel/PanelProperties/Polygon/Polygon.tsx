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
import PolygonHeader from './PolygonHeader/PolygonHeader';
import PositionSection from '../Common/PositionSection/PositionSection';
import ShapeStrokeSettings from '../Common/ShapeStrokeSettings/ShapeStrokeSettings';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

// types
import { NodeType } from 'types/design/enums';

const Polygon: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <PolygonHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions />
        <ColumnSpacing />
        <ColumnGridChildSpan />
      </UITools.Section>
      <AppearanceSection shapeCornerRadiusType={NodeType.polygon} withCornerRadius={false} withCount />
      <FillSection />
      <FillSection footer={<ShapeStrokeSettings type={NodeType.polygon} />} property="strokes" />
      <EffectsSection />
      <Export />
    </Fragment>
  );
};

export default Polygon;
