[&#x2B9C; Back to Kinetic Form Widgets](README.md#available-widgets)

## Utils

Utils are a set of utility functions provided by the portal code. They are accessed via `bundle.utils`.

```js
// How to access a utility function called `utilityFunction`
bundle.utils.utilityFunction(parameters);
```

### Available Utilities

- [Confirmation Modal](#confirmation-modal)
- [Toasts](#toasts)

---

[Back to Top](#utils)

### Confirmation Modal

A confirmation modal verifies users actions, and trigger a callback based on the user's decision.

_Only one confirmation modal may be rendered at a time._

#### Functions

![name=openConfirm](https://img.shields.io/badge/openConfirm%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders a confirmation modal. See [Confirmation Modal Options](#confirmation-modal-options) for details on available options.

![name=closeConfirm](https://img.shields.io/badge/closeConfirm%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Closes the open confirmation modal.

#### Confirmation Modal Options

![name=title](https://img.shields.io/badge/title-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The title to render in the modal.

![name=description](https://img.shields.io/badge/description-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The description to render in the modal.

![name=accept](https://img.shields.io/badge/accept%28%29-gray)
![type=function](https://img.shields.io/badge/Function-e66e22)  
The function to call when the user clicks the accept button.

![name=acceptLabel](https://img.shields.io/badge/acceptLabel-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The label for the accept button. Defaults to 'Continue'.

![name=cancel](https://img.shields.io/badge/cancel%28%29-gray)
![type=function](https://img.shields.io/badge/Function-e66e22)  
The function to call when the user clicks the cancel button.

![name=cancelLabel](https://img.shields.io/badge/cancelLabel-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The label for the cancel button. Defaults to 'Cancel'.

#### Examples

```js
// Open a confirmation modal
bundle.utils.openConfirm({
  title: 'Are you sure?',
  description: 'This action cannot be undone.',
  accept: function () {
    // TODO: do something if the user confirms their decision
  },
  acceptLabel: 'Yes',
  cancel: function () {
    // TODO: do something if the user cancels the action
  },
  cancelLabel: 'No',
});

// Close the confirmation modal
bundle.utils.closeConfirm();
```

---

[Back to Top](#utils)

### Toasts

Toasts render alert messages to the user, which are displayed at the top middle of the screen for a few seconds.

#### Functions

![name=toastSuccess](https://img.shields.io/badge/toastSuccess%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders a success toast on the page. See [Toast Options](#toast-options) for details on available options.

![name=toastError](https://img.shields.io/badge/toastError%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Renders an error toast on the page. See [Toast Options](#toast-options) for details on available options.

![name=clearToasts](https://img.shields.io/badge/clearToasts%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Closes all currently open toasts.

#### Toast Options

![name=title](https://img.shields.io/badge/title-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The title to render in the toast.

![name=description](https://img.shields.io/badge/description-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The description to render in the toast.

![name=duration](https://img.shields.io/badge/duration-gray)
![type=number](https://img.shields.io/badge/number-e66e22)  
The duration that the toast should be visible, in milliseconds. Success toasts default to 2 seconds, and error toasts default to 5 seconds.

![name=id](https://img.shields.io/badge/id-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
An optional id if the toast should appear in a specific context, such as inside a modal. The id must match an existing toast context.

#### Examples

```js
// Show a success toast that remains open for 3.5 seconds
bundle.utils.toastSuccess({
  title: 'Your action was successful',
  duration: 3500,
});

// Show an error toast
bundle.utils.toastError({
  title: 'There was an error performing your action',
  description: 'You do not have the proper permissions',
});

// Clear all toasts
bundle.utils.clearToasts();
```
