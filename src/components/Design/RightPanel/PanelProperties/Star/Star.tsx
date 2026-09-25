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
import PositionSection from '../Common/PositionSection/PositionSection';
import ShapeHeader from '../Common/ShapeHeader/ShapeHeader';
import ShapeStrokeSettings from '../Common/ShapeStrokeSettings/ShapeStrokeSettings';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';
import { translationNameSpace as starNameSpace } from './constants';

// types
import { NodeType } from 'types/design/enums';

const Star: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <ShapeHeader e2eValue="star" label={t(`${starNameSpace}.header.label`)} />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions />
        <ColumnSpacing />
        <ColumnGridChildSpan />
      </UITools.Section>
      <AppearanceSection countType={NodeType.star} shapeCornerRadiusType={NodeType.star} withCornerRadius={false} />
      <FillSection />
      <FillSection footer={<ShapeStrokeSettings type={NodeType.star} />} property="strokes" />
      <EffectsSection />
      <Export />
    </Fragment>
  );
};

export default Star;
