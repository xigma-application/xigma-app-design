import { render, screen } from '@testing-library/react';

// components
import StrokeSideFields from './StrokeSideFields';
import { TooltipProvider } from 'shared';

// others
import { MIXED_LABEL } from 'components/Design/RightPanel/PanelProperties/Common/constants';

describe('StrokeSideFields behaviors', () => {
  it('should show a weight field per side, with Mixed for a differing side', () => {
    // mock
    const onSideBlur = vi.fn<(side: string) => TFunc>(() => vi.fn());
    const onSideScrub = vi.fn(() => vi.fn());

    // before
    render(
      <TooltipProvider>
        <StrokeSideFields
          onDragEnd={vi.fn()}
          onDragStart={vi.fn()}
          onSideBlur={onSideBlur}
          onSideScrub={onSideScrub}
          sideScrubValues={{ bottom: 4, left: 1, right: 3, top: 2 }}
          sideWeights={{ bottom: 4, left: 1, right: 3, top: undefined }}
        />
      </TooltipProvider>,
    );

    // result
    expect(screen.getByLabelText('Stroke left weight')).toHaveValue('1');
    expect(screen.getByLabelText('Stroke top weight')).toHaveValue(MIXED_LABEL);
    expect(screen.getByLabelText('Stroke bottom weight')).toHaveValue('4');
    expect(onSideBlur.mock.calls.map(([side]) => side)).toEqual(['left', 'top', 'right', 'bottom']);
    expect(onSideScrub).toHaveBeenCalledTimes(4);
  });
});
