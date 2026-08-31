[&#x2B9C; Back to Kinetic Form Widgets](README.md#available-widgets)

## Search Widget

The search widget renders a typeahead style search field that can be configured to filter static data, or search data retrieved through an integration.

```js
// Initialize the Markdown widget
bundle.widgets.Search({ container, config, id });

// Retrieve a reference to the widget's API
bundle.widgets.Search.get(id);
```

### Parameters

![name=container](https://img.shields.io/badge/container-gray)
![type=HTMLElement](https://img.shields.io/badge/HTMLElement-e66e22)  
The HTML element into which the widget should be rendered.

<details>
<summary>
  <img alt="name=config" src="https://img.shields.io/badge/config-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  An object of configurations for the widget.
</summary>
<br>
<blockquote>

![name=options](https://img.shields.io/badge/options-gray)
![type=Object[]](https://img.shields.io/badge/Object[]-e66e22)  
List of objects to use as the static options for the search functionality.

<details>
<summary>
  <img alt="name=search" src="https://img.shields.io/badge/search-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Search configuration for how the user typed in value should be used in filtering the results when static options are provided.
</summary>
<br>
<blockquote>

<details>
<summary>
  <img alt="name=fields" src="https://img.shields.io/badge/fields-gray">
  <img alt="type=Object[]" src="https://img.shields.io/badge/Object[]-e66e22">
  <br>
  A list of fields that should be searched in the static list of options. This is ignored if the <code>fn</code> property is provided.
</summary>
<br>
<blockquote>

![name=name](https://img.shields.io/badge/name-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the property to search.

![name=value](https://img.shields.io/badge/value-gray)
![type=any](https://img.shields.io/badge/any-e66e22)  
The value that the option must match to be accepted. If omitted, the typed in user query will be used.

![name=operator](https://img.shields.io/badge/operator-gray)
![type=string](https://img.shields.io/badge/'equals'%7C'matches'%7C'startsWith'-e66e22)  
The operation type to use when searching through the options. Defaults to "startsWith".

</blockquote>
</details>

![name=fn](https://img.shields.io/badge/fn%28options%2c%20query%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A function to use for filtering the options based on the user query. It takes the list of options and the search query, and returns a filtered list of options.

</blockquote>
</details>

<details>
<summary>
  <img alt="name=integration" src="https://img.shields.io/badge/integration-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Data defining the integration to use for retrieving data for the search functionality.
</summary>
<br>
<blockquote>

![name=kappSlug](https://img.shields.io/badge/kappSlug-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The slug of the kapp in which the integration exists.

![name=formSlug](https://img.shields.io/badge/formSlug-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The slug of the form in which the integration exists. If omitted, a kapp integration will be used.

![name=integrationName](https://img.shields.io/badge/integrationName-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the integration to use.

![name=listProperty](https://img.shields.io/badge/listProperty-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the output property of the integration response that contains the list data to use.

<details>
<summary>
  <img alt="name=parameters" src="https://img.shields.io/badge/parameters-gray">
  <img alt="type=Object[]" src="https://img.shields.io/badge/Object[]-e66e22">
  <br>
  A list of parameters that should be passed into the integration.
</summary>
<br>
<blockquote>

![name=name](https://img.shields.io/badge/name-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the parameter to pass into the integration.

![name=value](https://img.shields.io/badge/value-gray)
![type=any](https://img.shields.io/badge/any-e66e22)  
The value to set the parameter to. If omitted, the typed in user query will be used.

</blockquote>
</details>

</blockquote>
</details>

![name=initialSelection](https://img.shields.io/badge/initialSelection-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
The option object that should be initially selected when the widget loads.

![name=optionToValue](https://img.shields.io/badge/optionToValue%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a value that can uniquely identify this option. If omitted, the `value` property of the option will be used.

![name=optionToLabel](https://img.shields.io/badge/optionToLabel%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a label that is rendered in the field when the option is selected. if omitted, the `label` property of the option will be used if it exists, otherwise the value from `optionToValue` will be used.

![name=optionToTitle](https://img.shields.io/badge/optionToTitle%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a title that is rendered in the list of options when the option is shown. If omitted, the label from `optionToLabel` will be used.

![name=optionToDescription](https://img.shields.io/badge/optionToDescription%28option%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that takes the current option and returns a description that is rendered in the list of options when the option is shown. If omitted, a description will not be shown.

![name=selectionBehavior](https://img.shields.io/badge/selectionBehavior-gray)
![type=string](https://img.shields.io/badge/'replace'%7C'clear'%7C'preserve'-e66e22)  
Behavior of the field when an option is selected: 'replace' (default) will show the option label, 'clear' will empty the field, and 'preserve' will keep the user's query.

![name=minSearchLength](https://img.shields.io/badge/minSearchLength-gray)
![type=number](https://img.shields.io/badge/number-e66e22)  
The number of character that need to be typed in before options are shown. Defaults to `1`.

![name=onChange](https://img.shields.io/badge/onChange%28selection%2c%20value%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function called when the value is changed. It is passed two parameters, the `selection` which is the selected option object, and the `value` string.

![name=onFocus](https://img.shields.io/badge/onFocus%28event%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function called when the field is focused.

![name=onBlur](https://img.shields.io/badge/onBlur%28event%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function called when the field is blurred.

![name=disabled](https://img.shields.io/badge/disabled-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the field be disabled.

![name=placeholder](https://img.shields.io/badge/placeholder-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Placeholder to render in the field when it is empty.

![name=icon](https://img.shields.io/badge/icon-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Name of the icon to render in the field. Defaults to `search`.

<details>
<summary>
  <img alt="name=messages" src="https://img.shields.io/badge/messages-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Object of status messages to display during various states.
</summary>
<br>
<blockquote>

![name=short](https://img.shields.io/badge/short-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Message to display when there are not enough character typed in to trigger a search.

![name=empty](https://img.shields.io/badge/empty-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Message to display when there are no results matching the query.

![name=pending](https://img.shields.io/badge/pending-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Message to display when options are being retrieved or filtered.

</blockquote>
</details>

</blockquote>
</details>

![name=id](https://img.shields.io/badge/id-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A unique id that can be used to retrieve the API of the widget.

### API

![name=getSelection](https://img.shields.io/badge/getSelection%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Returns the currently selected option object.

![name=setSelection](https://img.shields.io/badge/setSelection%28newSelection%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Sets the selection of the search field. The `newSelection` parameter must be an object of the same shape as the options the field uses.

![name=enable](https://img.shields.io/badge/enable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Disables the search field.

![name=disable](https://img.shields.io/badge/disable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Enables the search field.

### Examples

```js
// Render a search field that uses an integration
bundle.widgets.Search({
  // Render the widget into a Content element names "Requested For Widget"
  container: K('content[Requested For Widget]').element(),
  config: {
    // Use an integration to retrieve the options
    integration: {
      kappSlug: K('kapp').slug(),
      formSlug: K('form').slug(),
      integrationName: 'Search Users',
      listProperty: 'users',
      parameters: [{ name: 'Requested For' }],
    },
    // Define how to get the unique value for each option
    optionToValue: function (o) {
      return o.username;
    },
    // Define how to build a label for each option
    optionToLabel: function (o) {
      return o.displayName || o.username;
    },
    // When an option is selected in the search field, store the value in
    // a Text field named "Requested For"
    onChange: function (obj, value) {
      K('field[Requested For]').value(value);
    },
    placeholder: 'Search users...',
  },
  id: 'requested-for',
});

// Programatically clear the selection
bundle.widgets.Search.get('requested-for').setSelection();

// Programatically set the selection to the current user
bundle.widgets.Search.get('requested-for').setSelection(K('identity'));
```
