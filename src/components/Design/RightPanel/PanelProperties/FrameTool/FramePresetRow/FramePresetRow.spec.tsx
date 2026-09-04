import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ReactElement } from 'react';

// components
import CanvasRefsProvider from 'components/App/core/CanvasRefsProvider/CanvasRefsProvider';
import FramePresetRow from './FramePresetRow';

// store
import { store } from 'store';

const renderFramePresetRow = (ui: ReactElement): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <CanvasRefsProvider>{ui}</CanvasRefsProvider>
    </Provider>,
  );

describe('FramePresetRow snapshots', () => {
  it('should render its label and its dimensions', () => {
    // before
    const { asFragment } = renderFramePresetRow(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);

    // result
    expect(asFragment()).toMatchSnapshot();
  });
});

describe('FramePresetRow behaviors', () => {
  it('should render the preset label', () => {
    // before
    renderFramePresetRow(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);

    // result
    expect(screen.getByText('iPhone 17')).toBeInTheDocument();
  });

  it('should render the preset dimensions as width×height', () => {
    // before
    renderFramePresetRow(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);

    // result
    expect(screen.getByText('402×874')).toBeInTheDocument();
  });

  it('should not crash when clicked before the canvas is mounted', () => {
    // before
    renderFramePresetRow(<FramePresetRow preset={{ height: 874, label: 'iPhone 17', width: 402 }} />);
    const button = screen.getByRole('button');

    // action
    fireEvent.click(button);

    // result
    expect(button).toBeInTheDocument();
  });
});
