import { regRedux } from '../redux.js';

/**
 * Use redux state to store the open state of the confirmation modal. When
 * options are not null, then a modal should be shown, using the options data
 * as the content for the modal.
 */
const confirmActions = regRedux(
  'confirm',
  { options: null },
  {
    open(state, options = null) {
      state.options = options;
    },
  },
);

/**
 * Opens a confirmation modal to allow the user to confirm an action.
 *
 * @param {object} options
 * @param {string} [options.title] Title of the confirmation modal.
 * @param {string} [options.description] Description of the confirmation modal.
 * @param {Function} [options.accept] Function that will be called when the
 *  user clicks the accept button.
 * @param {string} [options.acceptLabel] Label for the accept button.
 * @param {Function} [options.cancel] Function that will be called when the
 *  user clicks the cancel button, or dismisses the modal using the close
 *  button, clicking outside it, or pressing escape.
 * @param {string} [options.cancelLabel] Label for the cancel button.
 */
export const openConfirm = options => {
  confirmActions.open(options);
};

/**
 * Closes the current confirmation modal.
 */
export const closeConfirm = () => {
  confirmActions.open(null);
};
