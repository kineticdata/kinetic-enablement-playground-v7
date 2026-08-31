[&#x2B9C; Back to Kinetic Form Widgets](README.md#available-widgets)

## Markdown Widget

The markdown widget renders a markdown editor (or viewer when disabled), allowing users to use a WYSIWYG markdown editor to input content, which will then be stored in a text field of the form.

```js
// Initialize the Markdown widget
bundle.widgets.Markdown({ container, field, config, id });

// Retrieve a reference to the widget's API
bundle.widgets.Markdown.get(id);
```

### Parameters

![name=container](https://img.shields.io/badge/container-gray)
![type=HTMLElement](https://img.shields.io/badge/HTMLElement-e66e22)  
The HTML element into which the widget should be rendered.

![name=field](https://img.shields.io/badge/field-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
The Kinetic field object of a text field with 2+ rows that should be used to store the value of the raw markdown content. The value of the field will be used as the initial value for the editor.

<details>
<summary>
  <img alt="name=config" src="https://img.shields.io/badge/config-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  An object of configurations for the widget.
</summary>
<br>
<blockquote>

![name=className](https://img.shields.io/badge/className-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
Additional class names to add to the wrapper of the widget.

![name=content](https://img.shields.io/badge/content-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
If you don't provide a field that stores the data, you can pass in content to render instead. Passing in content will render the markdown content instead of an editor.

![name=disabled](https://img.shields.io/badge/disabled-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the editor be disabled. If omitted, this will be set to `true` if the form is in review mode. When `disabled` is `true`, this widget will render the markdown content instead of an editor.

![name=editorProps](https://img.shields.io/badge/editorProps-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
Object of props to pass through to the editor component. See the `@toast-ui/react-editor` `Editor` component for valid options.

</blockquote>
</details>

![name=id](https://img.shields.io/badge/id-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A unique id that can be used to retrieve the API of the widget.

### API

![name=getValue](https://img.shields.io/badge/getValue%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Returns the current text value of the editor content.

![name=setValue](https://img.shields.io/badge/setValue%28newValue%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Sets the value of the markdown editor to the provided `newValue`.

![name=enable](https://img.shields.io/badge/enable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Disables the editor, and renders the markdown in a viewer instead.

![name=disable](https://img.shields.io/badge/disable%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Enables the editor and renders the content in editable mode.

### Examples

```js
// Renders a markdown editor
bundle.widgets.Markdown({
  // Render the widget into a Content element named "Markdown"
  container: K('content[Markdown]').element(),
  // Use a Text field names "Markdown Content" to store the data from the editor
  field: K('field[Markdown Content]'),
  config: {},
  id: 'my-markdown',
});
```
