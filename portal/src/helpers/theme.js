import { useEffect, useMemo, useRef, useState } from 'react';

export const THEME_SCHEMA = {
  colors: [
    'base-100',
    'base-200',
    'base-300',
    'base-content',
    'primary',
    'primary-content',
    'secondary',
    'secondary-content',
    'accent',
    'accent-content',
    'neutral',
    'neutral-content',
    'info',
    'info-content',
    'success',
    'success-content',
    'warning',
    'warning-content',
    'error',
    'error-content',
  ],
  radius: ['box', 'field', 'selector'],
};

/**
 * Object that will store the theme for the portal
 */
export const themeState = {
  // Has the theme been initialized
  ready: false,
  // The parsed theme data
  data: {},
  // A string of css variable overwrites to alter the theme
  css: null,
};

/**
 * Function that updates a state object with the provided theme data.
 *
 * @param {Object} state
 * @param {string} themeConfig JSON string of theme configurations.
 * @returns {Object}
 */
export const calculateThemeState = (state, themeConfig) => {
  state.ready = true;

  // If no data provided, clear the theme
  if (!themeConfig) {
    state.css = null;
    state.data = {};
    return state;
  }

  try {
    // Parse the provided attribute value
    const config = JSON.parse(themeConfig);
    state.data = config;
    // Generate a css stylesheet from the config
    state.css = buildStylesheet(config);
    return state;
  } catch (e) {
    console.error('Error parsing theme configuration:', e);
    return state;
  }
};

export const buildStyleObject = config => {
  const result = {};
  for (const c in config?.colors) {
    if (config.colors[c]) result[`--color-${c}`] = config.colors[c];
  }
  for (const r in config?.radius) {
    if (config.radius[r]) result[`--radius-${r}`] = config.radius[r];
  }
  return result;
};

const buildStylesheet = config =>
  ':root {\n' +
  Object.entries(buildStyleObject(config))
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n') +
  '\n}';

export const useDefaultTheme = () => {
  const ref = useRef();
  const [firstRender, setFirstRender] = useState(true);
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    // If ref is available and there is no theme yet, extract the default theme
    if (!theme && ref.current) {
      const styles = getComputedStyle(ref.current);
      setTheme({
        colors: THEME_SCHEMA.colors.reduce(
          (colorsMap, color) => ({
            ...colorsMap,
            [color]: styles.getPropertyValue(`--color-${color}`),
          }),
          {},
        ),
        radius: THEME_SCHEMA.radius.reduce(
          (radiusMap, radius) => ({
            ...radiusMap,
            [radius]: styles.getPropertyValue(`--radius-${radius}`),
          }),
          {},
        ),
      });
    }
    // If this is not the first render and there is no theme yet, set to an
    // empty object so this effect doesn't loop infinitely
    if (!firstRender && !theme) {
      setTheme({});
    }
    setFirstRender(false);
  }, [firstRender, theme]);

  return useMemo(() => [ref, theme], [theme]);
};
