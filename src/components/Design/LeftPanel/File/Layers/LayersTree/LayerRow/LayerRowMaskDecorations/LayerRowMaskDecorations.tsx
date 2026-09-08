import { FC, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

// components
import { Icon } from 'shared';

// others
import { NODE_ROW_MASK_BADGE_KEY } from 'components/Design/LeftPanel/File/Layers/constants';

// styles
import styles from './layer-row-mask-decorations.module.scss';

// types
import { TMaskConnectorLine } from 'store/design/selectors';

// utils
import { getShiftedLeftStyle } from './utils/getShiftedLeftStyle';

export type TLayerRowMaskDecorationsProps = {
  isMask: boolean;
  maskConnectorLines?: TMaskConnectorLine[];
};

const LayerRowMaskDecorations: FC<TLayerRowMaskDecorationsProps> = ({ isMask, maskConnectorLines = [] }) => {
  const { t } = useTranslation();

  return (
    <Fragment>
      {isMask && <span className={styles.LayerRowMaskDecorations__badge}>{t(NODE_ROW_MASK_BADGE_KEY)}</span>}
      {maskConnectorLines.map((line) => {
        const key = `${line.role}-${line.depthOffset}`;

        switch (line.role) {
          case 'masked-start':
            return (
              <div
                className={styles['LayerRowMaskDecorations__line--start']}
                key={key}
                style={getShiftedLeftStyle(26.5, line.depthOffset)}
              />
            );
          case 'masked-continue':
            return (
              <div
                className={
                  styles[line.depthOffset > 0 ? 'LayerRowMaskDecorations__line--continue-child' : 'LayerRowMaskDecorations__line--continue']
                }
                key={key}
                style={getShiftedLeftStyle(26.5, line.depthOffset)}
              />
            );
          case 'mask':
            return (
              <Icon
                className={styles.LayerRowMaskDecorations__lead}
                height={6}
                key={key}
                name="LeadArrow"
                style={getShiftedLeftStyle(27, line.depthOffset)}
                width={9}
              />
            );
          default:
            return undefined;
        }
      })}
    </Fragment>
  );
};

export default LayerRowMaskDecorations;
