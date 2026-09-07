import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ConstraintsPreview from './ConstraintsPreview/ConstraintsPreview';
import { UITools } from 'shared';

// hooks
import { useColumnAlignment } from '../ColumnAlignment/hooks/useColumnAlignment';

// others
import { HORIZONTAL_VALUES, translationNameSpace, VERTICAL_VALUES } from './constants';

// styles
import styles from './column-constraints.module.scss';

// types
import { AlignmentHorizontal, AlignmentVertical } from 'types/design/enums';
import { TDropdownOption } from 'shared/UITools/Dropdown/types';

const ColumnConstraints: FC = () => {
  const { t } = useTranslation();
  const { horizontal, setHorizontal, setVertical, vertical } = useColumnAlignment();

  const options = <T extends string>(values: readonly T[]): TDropdownOption<T>[] =>
    values.map((value) => ({ label: t(`${translationNameSpace}.option.${value}`), value }));

  return (
    <UITools.SectionColumn gridColumnType={UITools.GridColumnType.single} labels={[t(`${translationNameSpace}.label`)]} withBottomMargin>
      <div className={styles.ColumnConstraints__grid}>
        <UITools.Dropdown
          className={styles.ColumnConstraints__horizontal}
          options={options(HORIZONTAL_VALUES)}
          onSelect={(value) => setHorizontal(value)}
          value={horizontal ?? AlignmentHorizontal.left}
        />
        <UITools.Dropdown
          className={styles.ColumnConstraints__vertical}
          options={options(VERTICAL_VALUES)}
          onSelect={(value) => setVertical(value)}
          value={vertical ?? AlignmentVertical.top}
        />
        <div className={styles.ColumnConstraints__container}>
          <ConstraintsPreview alignment={{ horizontal, vertical }} setHorizontal={setHorizontal} setVertical={setVertical} />
        </div>
      </div>
    </UITools.SectionColumn>
  );
};

export default ColumnConstraints;
