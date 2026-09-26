import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import Export from '../Export/Export';
import FillSection from '../Common/FillSection/FillSection';
import PositionSection from '../Common/PositionSection/PositionSection';
import SelectionColorsSection from '../Common/SelectionColorsSection/SelectionColorsSection';
import ShapeStrokeSettings from '../Common/ShapeStrokeSettings/ShapeStrokeSettings';
import VectorDimensions from './VectorDimensions/VectorDimensions';
import VectorHeader from './VectorHeader/VectorHeader';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

// types
import { NodeType } from 'types/design/enums';

const Vector: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <VectorHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <VectorDimensions />
      </UITools.Section>
      <AppearanceSection withCornerRadius={false} />
      <FillSection />
      <FillSection footer={<ShapeStrokeSettings type={NodeType.vector} />} property="strokes" />
      <SelectionColorsSection />
      <Export />
    </Fragment>
  );
};

export default Vector;
