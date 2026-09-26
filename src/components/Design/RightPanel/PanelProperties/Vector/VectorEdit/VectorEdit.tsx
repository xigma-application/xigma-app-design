import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import FillSection from '../../Common/FillSection/FillSection';
import ShapeCornerRadiusInput from '../../Common/AppearanceSection/CornerRadius/ShapeCornerRadiusInput';
import ShapeStrokeSettings from '../../Common/ShapeStrokeSettings/ShapeStrokeSettings';
import VectorEditAlignment from './VectorEditAlignment/VectorEditAlignment';
import VectorEditMirroring from './VectorEditMirroring/VectorEditMirroring';
import VectorEditPosition from './VectorEditPosition/VectorEditPosition';
import { UITools } from 'shared';

// others
import { translationNameSpace as commonNameSpace } from '../../Common/constants';
import { translationNameSpace } from './constants';

// styles
import styles from './vector-edit.module.scss';

// types
import { NodeType } from 'types/design/enums';

const VectorEdit: FC = () => {
  const { t } = useTranslation();

  return (
    <Fragment>
      <UITools.Section e2eValue="vector-edit" label={<span className={styles.VectorEdit__title}>{t(`${translationNameSpace}.label`)}</span>}>
        <VectorEditAlignment />
        <VectorEditPosition />
        <VectorEditMirroring />
        <UITools.SectionColumn
          gridColumnType={UITools.GridColumnType.twoInputs}
          labels={[t(`${commonNameSpace}.appearanceSection.cornerRadius.ariaLabel`)]}
        >
          <ShapeCornerRadiusInput type={NodeType.vector} />
        </UITools.SectionColumn>
      </UITools.Section>
      <FillSection />
      <FillSection footer={<ShapeStrokeSettings type={NodeType.vector} />} property="strokes" />
    </Fragment>
  );
};

export default VectorEdit;
