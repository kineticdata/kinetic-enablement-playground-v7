import { createToaster } from '@ark-ui/react/toast';

// Id to use when one isn't provided
export const DEFAULT_ID = '_default_';

// Helper function to add default options to the toast
const buildOptions = options => ({ removeDelay: 300, ...options });

/**
 * Class for storing and managing initialized toasters.
 */
class Toasters {
  constructor() {
    this.list = {};
  }

  get(id = '') {
    return this.list[id];
  }

  init({ id = DEFAULT_ID, ...options } = {}) {
    // If a toaster has been previously created with this id, don't recreate it
    this.list[id] =
      this.list[id] ||
      createToaster({
        placement: 'top-middle',
        overlap: true,
        gap: 24,
        ...options,
        id,
      });
  }

  toast(fn, options, id) {
    if (typeof fn === 'function') {
      return fn(buildOptions(options));
    }
    console.error(
      id === DEFAULT_ID
        ? 'Toast failed. There is no default toast container.'
        : `Toast failed. There is no toast container matching the "${id}" id.`,
    );
  }

  success({ id = DEFAULT_ID, ...options } = {}) {
    return this.toast(this.list[id]?.success, options, id);
  }

  error({ id = DEFAULT_ID, ...options } = {}) {
    return this.toast(this.list[id]?.error, options, id);
  }

  clear() {
    Object.values(this.list).forEach(toaster => toaster.remove());
  }
}

// Instance of the Toasters class to use for the app
const toasters = new Toasters();

/**
 * @param {string} [id] Optional toast container ID.
 */
export const getToaster = toasters.get.bind(toasters);

/**
 * @param {object} options
 * @param {string} [options.id] ID to uniquely identify this toaster.
 * @param {string} [options.placement] Position of the toaster.
 */
export const initToaster = toasters.init.bind(toasters);

/**
 * Shows a toast with success styling.
 *
 * @param {object} options
 * @param {string} [options.id] ID of toast container to render this toast in.
 * @param {string} [options.title] Title of the toast.
 * @param {string} [options.description] Description of the toast.
 * @param {string} [options.duration] How long should the toast remain open.
 */
export const toastSuccess = toasters.success.bind(toasters);

/**
 * Shows a toast with error styling.
 *
 * @param {object} options
 * @param {string} [options.id] ID of toast container to render this toast in.
 * @param {string} [options.title] Title of the toast.
 * @param {string} [options.description] Description of the toast.
 * @param {string} [options.duration] How long should the toast remain open.
 */
export const toastError = toasters.error.bind(toasters);

/**
 * Clears all toasts.
 */
export const clearToasts = toasters.clear.bind(toasters);
