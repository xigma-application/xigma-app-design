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
  it('should render expanded by default with the "Layers" title and node list', () => {
    // before
    renderLayers();

    // result
    expect(screen.getByText('Layers')).toBeInTheDocument();
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(document.querySelector('[class*="LayersTree"]')).toBeInTheDocument();
  });

  it('should collapse when the header is clicked', () => {
    // before
    renderLayers();

    // action
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // result
    expect(screen.getByRole('button', { expanded: false })).toBeInTheDocument();
    expect(document.querySelector('[class*="LayersTree"]')).not.toBeInTheDocument();
  });

  it('should expand again when the header is clicked a second time', () => {
    // before
    renderLayers();
    fireEvent.click(screen.getByRole('button', { expanded: true }));

    // action
    fireEvent.click(screen.getByRole('button', { expanded: false }));

    // result
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(document.querySelector('[class*="LayersTree"]')).toBeInTheDocument();
  });
});
