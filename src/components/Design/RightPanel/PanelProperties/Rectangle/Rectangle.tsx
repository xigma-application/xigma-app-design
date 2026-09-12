import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import AppearanceSection from '../Common/AppearanceSection/AppearanceSection';
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import ColumnGridChildSpan from '../Common/ColumnGridChildSpan/ColumnGridChildSpan';
import PositionSection from '../Common/PositionSection/PositionSection';
import RectangleHeader from './RectangleHeader/RectangleHeader';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

const Rectangle: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <RectangleHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions />
        <ColumnGridChildSpan />
      </UITools.Section>
      <AppearanceSection />
    </Fragment>
  );
};

export default Rectangle;
