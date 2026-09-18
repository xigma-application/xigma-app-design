import { FC } from 'react';
import { useTranslation } from 'react-i18next';

// components
import ContrastBadge from './ContrastBadge/ContrastBadge';
import ContrastSettingsMenu from './ContrastSettingsMenu/ContrastSettingsMenu';
import { UITools } from 'shared';

// others
import contrastSwatchIconUrl from 'assets/icons/contrast.svg';
import { translationNameSpace } from './constants';

// styles
import styles from './contrast-checker.module.scss';

// types
import { ContrastCategory, ContrastLevel } from './enums';

export type TContrastCheckerProps = {
  canShowAAA: boolean;
  category: ContrastCategory;
  level: ContrastLevel;
  onAutoCorrect: TFunc;
  onSetCategory: TFunc<[ContrastCategory]>;
  onSetLevel: TFunc<[ContrastLevel]>;
  passes: boolean;
  ratio: number | null;
};

export const ContrastChecker: FC<TContrastCheckerProps> = ({
  canShowAAA,
  category,
  level,
  onAutoCorrect,
  onSetCategory,
  onSetLevel,
  passes,
  ratio,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.ContrastChecker}>
      <img alt="" className={styles.ContrastChecker__swatch} src={contrastSwatchIconUrl} />
      <button
        aria-label={t(`${translationNameSpace}.autoCorrectAriaLabel`)}
        className={styles.ContrastChecker__ratio}
        disabled={ratio === null || passes}
        onClick={onAutoCorrect}
        type="button"
      >
        {ratio !== null
          ? t(`${translationNameSpace}.ratioLabel`, { ratio: ratio.toFixed(2) })
          : t(`${translationNameSpace}.noBackgroundLabel`)}
      </button>
      {ratio !== null && <ContrastBadge label={t(`${translationNameSpace}.level.${level}`)} passes={passes} />}
      <UITools.Popover
        align="end"
        asChild
        trigger={
          <UITools.ButtonIcon
            ariaLabel={t(`${translationNameSpace}.settingsAriaLabel`)}
            className={styles.ContrastChecker__settingsTrigger}
            name="Settings"
            size={16}
          />
        }
      >
        <ContrastSettingsMenu
          canShowAAA={canShowAAA}
          category={category}
          level={level}
          onSelectCategory={onSetCategory}
          onSelectLevel={onSetLevel}
        />
      </UITools.Popover>
    </div>
  );
};

export default ContrastChecker;
