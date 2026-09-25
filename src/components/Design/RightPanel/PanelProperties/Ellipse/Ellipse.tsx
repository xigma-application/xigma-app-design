import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnGridChildSpan from '../Common/ColumnGridChildSpan/ColumnGridChildSpan';
import ColumnSpacing from '../Common/ColumnSpacing/ColumnSpacing';
import EllipseHeader from './EllipseHeader/EllipseHeader';
import Export from '../Export/Export';
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
      <AppearanceSection withArc withBlendMode={false} withCornerRadius={false} withEllipseCornerRadius />
      <Export />
    </Fragment>
  );
};

export default Ellipse;
