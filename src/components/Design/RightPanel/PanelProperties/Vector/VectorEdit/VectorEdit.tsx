import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ColumnSpacing from '../../Common/ColumnSpacing/ColumnSpacing';
import FillSection from '../../Common/FillSection/FillSection';
import PanelHeader from '../../Common/PanelHeader/PanelHeader';
import SelectionColorsSection from '../../Common/SelectionColorsSection/SelectionColorsSection';
import ShapeStrokeSettings from '../../Common/ShapeStrokeSettings/ShapeStrokeSettings';
import VectorDimensions from '../VectorDimensions/VectorDimensions';
import VectorEditAlignment from './VectorEditAlignment/VectorEditAlignment';
import VectorEditCornerRadius from './VectorEditCornerRadius/VectorEditCornerRadius';
import VectorEditMirroring from './VectorEditMirroring/VectorEditMirroring';
import VectorEditPosition from './VectorEditPosition/VectorEditPosition';
import { UITools } from 'shared';

// others
import { translationNameSpace as commonNameSpace } from '../../Common/constants';
import { translationNameSpace as panelNameSpace } from '../../constants';
import { translationNameSpace } from './constants';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { useAppSelector } from 'store';

// styles
import styles from './vector-edit.module.scss';

// types
import { NodeType } from 'types/design/enums';

const VectorEdit: FC = () => {
  const { t } = useTranslation();
  const count = useAppSelector(selectVectorEditingNodeIds).length;
  const isMultiple = count > 1;

  return (
    <Fragment>
      {isMultiple && <PanelHeader buttons={null} e2eValue="vector-edit" label={t(`${panelNameSpace}.mixed.header.label`, { count })} />}
      <UITools.Section
        e2eValue="vector-edit"
        label={isMultiple ? undefined : <span className={styles.VectorEdit__title}>{t(`${translationNameSpace}.label`)}</span>}
      >
        <VectorEditAlignment />
        <VectorEditPosition />
        <VectorEditMirroring />
        <VectorEditCornerRadius />
      </UITools.Section>
      {isMultiple && (
        <UITools.Section e2eValue="layout" label={t(`${commonNameSpace}.layoutSection.label`)}>
          <VectorDimensions />
          <ColumnSpacing />
        </UITools.Section>
      )}
      <FillSection />
      <FillSection footer={<ShapeStrokeSettings type={NodeType.vector} />} property="strokes" />
      {isMultiple && <SelectionColorsSection />}
    </Fragment>
  );
};

export default VectorEdit;
