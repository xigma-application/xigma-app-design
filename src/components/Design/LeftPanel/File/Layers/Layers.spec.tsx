import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';

// components
import Layers from './Layers';

// store
import { store } from 'store';

const renderLayers = (): ReturnType<typeof render> =>
  render(
    <Provider store={store}>
      <Layers />
    </Provider>,
  );

describe('Layers', () => {
  it('should render collapsed by default with the "Layers" title', () => {
    // before
    renderLayers();

    // result
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
  });

  it('should expand when the header is clicked', () => {
    // before
    renderLayers();

    // action
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // result
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
  });

  it('should render the node list once expanded', () => {
    // before
    renderLayers();

    // action
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // result
    expect(document.querySelector('[class*="resize-handle"]')).toBeInTheDocument();
  });

  it('should collapse again when the header is clicked a second time', () => {
    // before
    renderLayers();
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // action
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // result
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    expect(document.querySelector('[class*="resize-handle"]')).not.toBeInTheDocument();
  });
});
