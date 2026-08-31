import { configureStore, combineSlices, createSlice } from '@reduxjs/toolkit';

// Init state with a reducer that we can trigger each time we inject a new slice
const init = createSlice({
  name: 'init',
  initialState: false,
  reducers: { regRedux: () => true },
});

// Root reducer that we'll inject slices into as they get added by the regRedux
// function defined below
const rootReducer = combineSlices(init);

// Create a function to inject a slice into the root reducer and trigger the
// init reducer to make sure the new slice's initial state gets populated,
// because the state of an injected slice is undefined until any action is fired
const injectSlice = slice => {
  rootReducer.inject(slice, { overrideExisting: true });
  store.dispatch(init.actions.regRedux());
};

// Configure the redux store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Disable warning for passing non-serializable data into reducer
      serializableCheck: {
        ignoredActions: [
          // Event object
          'view/handleResize',
          // Callback functions for confirmation modal
          'confirm/open',
        ],
        ignoredPaths: [
          // Callback functions for confirmation modal
          'confirm.options.accept',
          'confirm.options.cancel',
        ],
      },
    }),
});

/**
 * @name ReducerFn
 * @function
 * @desc Function that should mutate the state based on the payload. This
 *  function uses the `immer` library to allow safe mutations of `state`.
 * @param {*} state - The state value when this reducer is triggered.
 * @param {*} [payload] - The payload provided when this reducer is triggered.
 */

/**
 * @name ActionFn
 * @function
 * @desc Function that dispatches the corresponding action to trigger the
 *  reducer.
 * @param {*} [payload] - The payload to provide to the corresponding reducer.
 */

/**
 * Helper function for registering global redux state. Allows for setting an
 * initial state and creating functions to modify that state.
 *
 * @param {String} name - The property name used in the redux store.
 * @param {*} initialState - The initial state.
 * @param {Object.<string, ReducerFn>} reducers - A map of reducer functions.
 * @returns {Object.<string, ActionFn>} A map of functions that dispatch the
 *  actions of the reducer.
 */
export const regRedux = (name, initialState, reducers) => {
  // Create the slice
  const slice = createSlice({
    name,
    initialState,
    reducers: Object.fromEntries(
      Object.entries(reducers).map(([k, v]) => [
        k,
        (state, { payload }) => v(state, payload),
      ]),
    ),
  });
  // Inject the slice into the root reducer
  injectSlice(slice);
  // Return the actions wrapped with `store.dispatch`
  return Object.fromEntries(
    Object.entries(slice.actions).map(([k, v]) => [
      k,
      (...args) => store.dispatch(v(...args)),
    ]),
  );
};
