import t from 'prop-types';
import { Suspense, lazy } from 'react';
// Import a map of dynamic imports for the tabler icons so we can lazy load them
import tablerIcons from '@tabler/icons-react/dist/esm/dynamic-imports.mjs';
// Import function to create tabler icons so we can create pending and missing icons
import createTablerIcon from '@tabler/icons-react/dist/esm/createReactComponent.mjs';

// An empty icon to show while the actual icon is being loaded
const Blank = createTablerIcon('outline', 'icon-blank', 'IconBlank', []);

// An icon to show if an icon with the provided name doesn't exist
const Missing = createTablerIcon('outline', 'icon-missing', 'IconMissing', [
  ['path', { d: 'M3 3h18', key: 'svg-0', stroke: 'red' }],
  ['path', { d: 'M3 7v4a1 1 0 0 0 1 1h3M7 7v10', key: 'svg-1' }],
  [
    'path',
    {
      d: 'M10 8v8a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1z',
      key: 'svg-2',
    },
  ],
  ['path', { d: 'M17 7v4a1 1 0 0 0 1 1h3M21 7v10', key: 'svg-3' }],
  ['path', { d: 'M3 21h18', key: 'svg-4', stroke: 'red' }],
]);

// Map to store loaded icons so React.lazy doesn't try reloading the same ones.
// Prepopulate the map with any custom icons we want
const loadedIcons = { blank: Blank };

/**
 * Renders an icon from the Tabler Icons library.
 *
 * @param {string} name The name of the icon to render.
 * @param {boolean} [filled] Should the icon be filled. You can also accomplish
 *  this by appending '-filled' to the name.
 * @param {number} [size=24] The size of the icon, in pixels.
 * @param {Object} [passThroughProps] Any additional props will we passed
 *  through to the component.
 */
export const Icon = ({ name, filled, size, ...passThroughProps }) => {
  // Append '-filled' to the name if the `filled` prop is truthy
  const iconName = `${name}${filled && !name.endsWith('-filled') ? '-filled' : ''}`;

  // If the icon component has been previously loaded, use that do we don't try
  // to reload it again on a rerender
  if (loadedIcons[iconName]) {
    const IconComponent = loadedIcons[iconName];
    return <IconComponent size={size} {...passThroughProps}></IconComponent>;
  }

  // Check if the icon exists in the map of icon imports
  const iconImport = tablerIcons[iconName];

  // If it exists render it
  if (iconImport) {
    // Import the icon using lazy loading, wrapping the import method so we can
    // store the loaded component in the loadedIcons map
    const IconComponent = lazy(() =>
      iconImport().then(module => {
        loadedIcons[iconName] = module.default;
        return module;
      }),
    );

    // Render the icon, with a fallback while it's loading
    return (
      <Suspense fallback={<Blank size={size} {...passThroughProps}></Blank>}>
        <IconComponent size={size} {...passThroughProps}></IconComponent>
      </Suspense>
    );
  }

  // If it doesn't exist, render the Missing icon
  return <Missing size={size} {...passThroughProps}></Missing>;
};

Icon.propTypes = {
  name: t.string.isRequired,
  filled: t.bool,
  size: t.number,
};
