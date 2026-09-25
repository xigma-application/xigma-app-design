import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnDimensions from '../Common/ColumnDimensions/ColumnDimensions';
import Export from '../Export/Export';
import PositionSection from '../Common/PositionSection/PositionSection';
import SliceHeader from './SliceHeader/SliceHeader';
import { UITools } from 'shared';

// others
import { translationNameSpace } from '../Common/constants';

const Slice: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <SliceHeader />
      <PositionSection />
      <UITools.Section e2eValue="layout" label={t(`${translationNameSpace}.layoutSection.label`)}>
        <ColumnDimensions />
      </UITools.Section>
      <Export />
    </Fragment>
  );
};

export default Slice;
