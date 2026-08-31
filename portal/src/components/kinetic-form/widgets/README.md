# Kinetic Form Widgets

Widgets are small, standalone React apps that can be rendered inside Kinetic forms to provide more complex functionality within the server side rendered form.

## Table of Contents

- [How to Use Widgets](#how-to-use-widgets)
- [Available Widgets, Utils, and Styles](#available-widgets)
  - [Markdown](MARKDOWN.md)
  - [Search](SEARCH.md)
  - [Signature](SIGNATURE.md)
  - [Subform](SUBFORM.md)
  - [Table](TABLE.md)
  - [Utils](UTILS.md)
  - [Styles](STYLES.md)
- [How to Build Widgets](#how-to-build-widgets)

---

## How to Use Widgets

We define functions in a global `bundle.widgets` namespace to expose widgets, and they can then be used in Kinetic form events.

Given a widget called `CustomWidget`, the following code will render the widget into the form.

```js
bundle.widgets.CustomWidget({
  // The container parameter must be an HTML element into which the widget should be rendered.
  // Here we are using a Kinetic section element.
  container: K('section[Widget Section]').element(),
  // The config parameter will allow you to pass specific configurations to a widget.
  config: {},
  // The id parameter lets you uniquely name this instance of the widget so you can access it later.
  id: 'my-widget',
  // There may be other required properties for different widgets.
});
```

Widgets will return a Promise that is resolved after the widget is rendered. The promise will provide an API object, exposing data and functions to allow you to interact with the widget. Different widgets may expose additional API functions specific to their functionality.

Chaining a `.then` function to the widget function will allow you to interact with the widget immediately after it is initialized.

```js
bundle.widgets
  .CustomWidget({
    /* config such as above */
  })
  .then(function (customWidgetAPI) {
    // The `container` API function is available on all widgets, and returns the
    // container element that the widget is rendered in.
    customWidgetAPI.container();
    // The `destroy` API function is available on all widgets, and removes the
    // widget from the form.
    customWidgetAPI.destroy();
    // There will be additional API functions available that will be specific to
    // each widget's functionality.
  });
```

If you need to access the widget's API elsewhere in your form, you can do so using the widget's static `get` function, as long as you provided an `id` parameter when initializing the widget.

```js
// Get the API object for a widget by id
const customWidgetAPI = bundle.widgets.CustomWidget.get('my-widget');
// Use the API
customWidgetAPI.container();
customWidgetAPI.destroy();
```

You can also access a map of all instances of a widget using the static `instances` property.

```js
bundle.widgets.CustomWidget.instances;
/**
 * The above will result in the following object:
 * {
 *   'my-widget': {
 *     container: Function,
 *     destroy: Function,
 *     // Other API functions
 *   },
 *   // Other Custom Widget instances
 * }
 */
```

---

## Available Widgets

### Markdown

The markdown widget renders a markdown editor (or viewer when disabled), allowing users to use a WYSIWYG markdown editor to input content, which will then be stored in a text field of the form.

[Markdown Widget Documentation &#x2B9E;](MARKDOWN.md)

### Search

The search widget renders a typeahead style search field that can be configured to filter static data, or search data retrieved through an integration.

[Search Widget Documentation &#x2B9E;](SEARCH.md)

### Signature

The signature widget renders a signature element, which opens a modal where the user can draw or type their signature. That signature is then stored as an image in an attachment field on the form.

[Signature Widget Documentation &#x2B9E;](SIGNATURE.md)

### Subform

The subform widget renders a Kinetic form in either a modal or inline, allowing users to provide additional information, and the builder to collect the data and store it however they find appropriate.

[Subform Widget Documentation &#x2B9E;](SUBFORM.md)

### Table

The table widget renders a table with data sourced from either a static list, a Kinetic form field, or an integration. The table can be configured to render action buttons that can manage the data in the table, and provides support for filtering, sorting, column management, and pagination.

[Table Widget Documentation &#x2B9E;](TABLE.md)

---

### Utils

Utils are a collection of helper functions that provide various functionality, such as rendering toasts and confirmation modals. They are accessed through the `bundle.utils` namespace instead of `bundle.widgets`.

[Utils Documentation &#x2B9E;](UTILS.md)

---

### Styles

This portal uses Tailwind CSS and DaisyUI for styling, which is compiled to only include classes that are used. This means that not all classes are available to be used in forms. This documentation lists the classes that have been made available.

[Styles Documentation &#x2B9E;](STYLES.md)

---

## How to Build Widgets

To build a custom widget, you will create a new file in this directory for that widget, and implement the specific functionality there. There are some helper functions in the `./index.js` file that help us build new widgets.

| name                | type              | description                                                                                                                                                                  |
| ------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registerWidget`    | `function`        | A function that handles rendering the widget into the provided container, exposes the API for the widget, and handles tracking the widget and cleaning it up when necessary. |
| `validateContainer` | `function`        | A function that validates that the `container` parameter is a valid HTML element.                                                                                            |
| `validateField`     | `function`        | A function that validates that a `field` parameter is a Kinetic field object, and can also verify the type of the field.                                                     |
| `validateForm`      | `function`        | A function that validates that a `form` parameter is a Kinetic form object.                                                                                                  |
| `WidgetAPI`         | `React Component` | A component that wraps the custom widget functionality in order to expose an API for the widget.                                                                             |

### Defining the Custom Widget Functionality

First you will create a component that will be rendered by the widget. This component is where you will implement all of your custom functionality. (If you need to split this into multiple components or files, that's fine, but the result should be a single component that will be rendered by the widget.)

Your component must follow the following rules:

- It must use `React.forwardRef` so we can forward a `ref` to the `WidgetAPI` component that it will render.
- It must render the `WidgetAPI` component, by wrapping it around the returned content.
  - The `WidgetAPI` component must be passed the forwarded `ref`.
  - The `WidgetAPI` component may be passed an `api` prop which should be a mutable object of functions or properties that the widget would like to expose when it is used. Using a custom `ref` for the API object is recommended so that your component can mutate it as its state changes.

Beyond the above rules, your component can add any additional logic it needs.

```jsx
const CustomWidgetComponent = React.forwardRef((props, ref) => {
  // Define a ref as the API object so we can mutate it
  const api = useRef({
    /* initial API data and functions */
  });

  // Define an effect that will update the mutable `api` ref anytime a value or
  // function that's part of the API changes
  useEffect(
    () => {
      Object.assign(api.current, {
        /* changed data or function */
      });
    },
    [
      /* data or functions that may change and are part of the api */
    ],
  );

  return (
    // Pass through the forwarded ref, and the custom api ref object
    <WidgetAPI ref={ref} api={api.current}>
      Your custom JSX should be rendered here.
    </WidgetAPI>
  );
});
```

### Defining the Custom Widget Function

After the widget component is created, you will create a function that will be used to initialize the widget. The majority of this process is done by the helper functions described above. This is the function that will be exported from this file.

```jsx
export const CustomWidget = ({ container, config, id } = {}) => {
  if (validateContainer(container, 'Custom')) {
    return registerWidget(CustomWidget, {
      container,
      Component: CustomWidgetComponent,
      props: { ...config /*, otherProps? */ },
      id,
    });
  }
  return Promise.reject(
    'The Test widget parameters are invalid. See the console for more details.',
  );
};
```

The parameters that this function accepts are up to you, and will depend on the purpose of the widget. Typically, `container`, `config`, and `id` will almost always be needed. Sometimes you will need a reference to a Kinetic field or the Kinetic form, so those may be others you would add. The contents of the `config` object are specific to your widget.

This function must follow the following rules:

- It must validate the parameters to make sure the user is providing valid data. There are helper functions for validating the container, as well as Kinetic field and form objects, but you may also add widget specific validations.
  - If the validations fail, the function must return a rejected Promise.
- If the parameters are valid, it must call `registerWidget` and return the response of that function. `registerWidget` accepts a reference to this function as the first parameter, and the following properties inside an object as the second parameter:
  - `container` The HTML element into which your widget component should be rendered.
  - `Component` The custom widget component you defined in the previous step.
  - `props` Any props that should be passed to the above component. Typically, you will pass in the config here.
  - `id` A unique ID if passed into the widget function.

### Exposing the Custom Widget

Once the widget function has been created, it needs to be exposed via the `bundles.widgets` namespace.

To do this, go into the `./widgets.js` file, import your new widget function, and add it to the `AVAILABLE_WIDGETS` map. And that's it! You can now access your new widget from the `bundles.widgets` global variable.
