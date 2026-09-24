import { FC, ReactElement } from 'react';

// components
import LayoutGuideColumnsFields from './LayoutGuideColumnsFields/LayoutGuideColumnsFields';
import LayoutGuideGridFields from './LayoutGuideGridFields/LayoutGuideGridFields';
import LayoutGuideRowsFields from './LayoutGuideRowsFields/LayoutGuideRowsFields';
import LayoutGuideSettingsHeader from './LayoutGuideSettingsHeader/LayoutGuideSettingsHeader';

// hooks
import {
  TUseLayoutGuideSettingsPanelResult,
  useLayoutGuideSettingsPanel,
} from './hooks/useLayoutGuideSettingsPanel/useLayoutGuideSettingsPanel';

// styles
import styles from './layout-guide-settings-panel.module.scss';

// types
import { LayoutGuideType } from 'types/design/enums';
import { TLayoutGuide } from 'types/design/types';
import { TLayoutGuideNumberField } from 'utils/design/layoutGuides/getLayoutGuideFieldValue';

export type TLayoutGuideSettingsPanelProps = {
  guide: TLayoutGuide;
  isStretchedOnAny: boolean;
  mixedKeys: Set<keyof TLayoutGuide>;
  onChange: TFunc<[Partial<TLayoutGuide>]>;
  onClose: TFunc;
  onDragEnd: TFunc;
  onDragStart: TFunc;
  onFieldScrub: TFunc<[TLayoutGuideNumberField, number, number]>;
};

const renderTypeFields = (
  { guide, isStretchedOnAny, mixedKeys, onChange, onDragEnd, onDragStart }: TLayoutGuideSettingsPanelProps,
  panel: TUseLayoutGuideSettingsPanelResult,
): ReactElement => {
  const { onBlur, onCommitAlpha, onCommitHex, onPickerChange, onScrub } = panel;

  switch (guide.type) {
    case LayoutGuideType.columns:
      return (
        <LayoutGuideColumnsFields
          guide={guide}
          isStretchedOnAny={isStretchedOnAny}
          mixedKeys={mixedKeys}
          onBlur={onBlur}
          onChange={onChange}
          onCommitAlpha={onCommitAlpha}
          onCommitHex={onCommitHex}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPickerChange={onPickerChange}
          onScrub={onScrub}
        />
      );
    case LayoutGuideType.rows:
      return (
        <LayoutGuideRowsFields
          guide={guide}
          isStretchedOnAny={isStretchedOnAny}
          mixedKeys={mixedKeys}
          onBlur={onBlur}
          onChange={onChange}
          onCommitAlpha={onCommitAlpha}
          onCommitHex={onCommitHex}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPickerChange={onPickerChange}
          onScrub={onScrub}
        />
      );
    default:
      return (
        <LayoutGuideGridFields
          guide={guide}
          mixedKeys={mixedKeys}
          onBlur={onBlur}
          onCommitAlpha={onCommitAlpha}
          onCommitHex={onCommitHex}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          onPickerChange={onPickerChange}
          onScrub={onScrub}
        />
      );
  }
};

export const LayoutGuideSettingsPanel: FC<TLayoutGuideSettingsPanelProps> = (props) => {
  const { guide, mixedKeys, onChange, onClose, onFieldScrub } = props;
  const panel = useLayoutGuideSettingsPanel(guide, mixedKeys, onChange, onFieldScrub);

  return (
    <div className={styles.LayoutGuideSettingsPanel}>
      <LayoutGuideSettingsHeader onClose={onClose} onTypeChange={(type): void => onChange({ type })} type={guide.type} />
      <div className={styles.LayoutGuideSettingsPanel__body}>{renderTypeFields(props, panel)}</div>
    </div>
  );
};

export default LayoutGuideSettingsPanel;
