import { regRedux } from '../redux.js';

/**
 * Use redux state to store the open state of the confirmation modal. When
 * options are not null, then a modal should be shown, using the options data
 * as the content for the modal.
 */
const searchActions = regRedux(
  'search',
  { open: false, searchOnly: false, popularForms: null },
  {
    open(state, { searchOnly } = {}) {
      state.open = true;
      state.searchOnly = searchOnly;
    },
    close(state) {
      state.open = false;
      state.searchOnly = false;
    },
    setPopularForms(state, popularForms) {
      state.popularForms = popularForms;
    },
  },
);

/**
 * Opens a confirmation modal to allow the user to confirm an action.
 *
 * @param {object} [options]
 * @param {boolean} [options.searchOnly] Should the modal only show the search.
 */
export const openSearch = options => {
  searchActions.open(options);
};

/**
 * Closes the current confirmation modal.
 */
export const closeSearch = () => {
  searchActions.close();
};

/**
 * Stores the popular forms into state.
 *  @param {object[]} popularForms List of popular forms
 */
export const setPopularForms = popularForms => {
  searchActions.setPopularForms(popularForms);
};
