[&#x2B9C; Back to Kinetic Form Widgets](README.md#available-widgets)

## Table Widget

The table widget renders a table of data that can either be passed in as a static list, extracted from a Kinetic form field, or retrieved via an integration. The table provides configurations for sorting, filtering, pagination, and custom events to modify the data.

```js
// Initialize the Table widget
bundle.widgets.Table({ container, field, config, id });

// Retrieve a reference to the widget's API
bundle.widgets.Table.get(id);
```

### Parameters

![name=container](https://img.shields.io/badge/container-gray)
![type=HTMLElement](https://img.shields.io/badge/HTMLElement-e66e22)  
The HTML element into which the widget should be rendered.

![name=field](https://img.shields.io/badge/field-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
The Kinetic field object of a text field that should be used to store the stringified table data of the table. The value of the field will be parsed and used as the initial values for the table if no `data` or `integration` configurations are provided.

<details>
<summary>
  <img alt="name=config" src="https://img.shields.io/badge/config-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  An object of configurations for the widget.
</summary>
<br>
<blockquote>

![name=data](https://img.shields.io/badge/data-gray)
![type=Object[]](https://img.shields.io/badge/Object[]-e66e22)  
List of data used to populate the table when initialized.

<details>
<summary>
  <img alt="name=integration" src="https://img.shields.io/badge/integration-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Data defining the integration to use for retrieving data for the table.
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

![name=errorProperty](https://img.shields.io/badge/errorProperty-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the output property of the integration response that contains the error if one occurs when retrieving the data.

![name=parameters](https://img.shields.io/badge/parameters-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
A map of parameters that should be passed into the integration.

</blockquote>
</details>

![name=rowTransform](https://img.shields.io/badge/rowTransform%28row%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A transform function which will be applied to each row of data before the data is used in the table.

![name=onDataError](https://img.shields.io/badge/onDataError%28error%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A callback function that is triggered if there is an error retrieving the data for the table.

![name=onDataSuccess](https://img.shields.io/badge/onDataSuccess%28rows%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A callback function that is triggered when the data for the table is successfully retrieved. This happens on initialization, and each time the data is reloaded.

![name=sortable](https://img.shields.io/badge/sortable-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the table allow sorting the data. Defaults to `true`.

![name=filterable](https://img.shields.io/badge/filterable-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the table allow filtering the data. Defaults to `true`.

![name=toggleable](https://img.shields.io/badge/toggleable-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the table allow changing the visibility of columns. Defaults to `true`.

<details>
<summary>
  <img alt="name=columns" src="https://img.shields.io/badge/columns-gray">
  <img alt="type=Object[]" src="https://img.shields.io/badge/Object[]-e66e22">
  <br>
  List of configurations for defining the columns of the table.
</summary>
<br>
<blockquote>

![name=label](https://img.shields.io/badge/label-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The text to render in the header cell of the column.

![name=property](https://img.shields.io/badge/property-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The key used to retrieve the value for this column from the row data. This is required and must be unique across all columns.

![name=displayTransform](https://img.shields.io/badge/displayTransform%28value,%20row%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A transform function whose result will be rendered in the body cell of the column. This can be used to change or format the value. Defaults to the actual value.  
It is passed the `value` of the cell, and the `row` object, containing all values for the row.

![name=sortable](https://img.shields.io/badge/sortable-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Can the table be sorted by this column (if the table allows sorting). Defaults to `true`.

![name=sortTransform](https://img.shields.io/badge/sortTransform%28value,%20row%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A transform function whose result will be used when sorting by this column. Defaults to the actual value.  
It is passed the `value` of the cell, and the `row` object, containing all values for the row.

![name=filterable](https://img.shields.io/badge/filterable-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Can the table be filtered on this column's data (if the table allows filtering). Defaults to `true`.

![name=filterTransform](https://img.shields.io/badge/filterTransform%28value,%20row%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A transform function whose result will be used when filtering data. Defaults to the actual value.  
It is passed the `value` of the cell, and the `row` object, containing all values for the row.

![name=filterOperator](https://img.shields.io/badge/filterOperator-gray)
![type=string](https://img.shields.io/badge/'matches'%7C'equals'%7C'startsWith'-e66e22)  
The type of operator used when filtering this column's data. All filtering is case-insensitive. Defaults to `matches`.  
Possible options are:  
`matches` - checks if the query matches any part of cell value.  
`equals` - checks if the query exactly matches the entire cell value.  
`startsWith` - checks if the query matches the start of the cell value.

![name=filterFn](https://img.shields.io/badge/filterFn%28query,%20value,%20row%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A custom function used when filtering data. It should return `true` if the cell matches the query. When provided, the `filterOperator` is ignored.  
It is passed the `query` value, the `value` of the cell, and the `row` object containing all values for the row.  
The provided `query` and `value` parameters have not had their case synchronized.

![name=visible](https://img.shields.io/badge/visible-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the column be visible when the table is rendered.

![name=toggleable](https://img.shields.io/badge/toggleable-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Can the visibility of the column be toggles (if the table allows toggling column visibility).

![name=onClick](https://img.shields.io/badge/onClick%28row,%20index,%20tableApi%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that when provided, the cell value will be rendered as a button, and this function will be triggered when the cell value is clicked.  
It is passed a `row` object containing the data of the row, the `index` of the row (the absolute index from all data, not just the current page), and a `tableApi` parameter, which provides access to the [API](#api) functions defined below.

![name=footerTransform](https://img.shields.io/badge/footerTransform%28currentRows,%20tableApi%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function that generates a value for the footer of the column. A footer is only rendered if at least one column provides this function.  
It is passed a `currentRows` list containing the currently visible rows of the table, and a `tableApi` parameter, which provides access to the [API](#api) functions defined below.

![name=headerCellClass](https://img.shields.io/badge/headerCellClass-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A string of classes to add to the header cell of this column.

![name=bodyCellClass](https://img.shields.io/badge/bodyCellClass-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A string of classes to add to the body cell of this column.

![name=footerCellClass](https://img.shields.io/badge/footerCellClass-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A string of classes to add to the footer cell of this column.

![name=headerCellStyles](https://img.shields.io/badge/headerCellStyles-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
An object of styles to add to the header cell of this column. Any style names that have hyphens should instead use camelCase.

![name=bodyCellStyles](https://img.shields.io/badge/bodyCellStyles-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
An object of styles to add to the body cell of this column. Any style names that have hyphens should instead use camelCase.

![name=footerCellStyles](https://img.shields.io/badge/footerCellStyles-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
An object of styles to add to the footer cell of this column. Any style names that have hyphens should instead use camelCase.

<details>
<summary>
  <img alt="name=fieldConfig" src="https://img.shields.io/badge/fieldConfig-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Configuration object used for rendering the columns as a form, used for the built-in row add and update actions. This data is passed to the `fields` configuration of the `Subform` widget, which is used behind the scenes for this functionality.  
</summary>
<br>
<blockquote>

![name=type](https://img.shields.io/badge/type-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The type of field to render. Available options are 'text', 'checkbox', 'date', 'datetime', or 'time'. Fields without a type will not be rendered.

![name=required](https://img.shields.io/badge/required-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the field be required. Defaults to false.

![name=disabled](https://img.shields.io/badge/disabled-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the field be disabled. Defaults to false.

![name=validate](https://img.shields.io/badge/validate%28value,%20data%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Validation function for validating this field. It should return an array of error messages if the field is invalid.

</blockquote>
</details>

</blockquote>
</details>

<details>
<summary>
  <img alt="name=addAction" src="https://img.shields.io/badge/addAction-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Configuration for the add row button. If omitted, the button will not be rendered.
</summary>
<br>
<blockquote>

![name=label](https://img.shields.io/badge/label-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The label for the add row button. Defaults to 'Add Row'.

![name=icon](https://img.shields.io/badge/icon-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the Tabler icon to use for the add row button. Defaults to 'plus'.

![name=onClick](https://img.shields.io/badge/onClick%28tableApi%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function to call when the add row button is clicked.  
It is passed a `tableApi` parameter, which provides access to the [API](#api) functions defined below.

</blockquote>
</details>

<details>
<summary>
  <img alt="name=rowActions" src="https://img.shields.io/badge/rowActions-gray">
  <img alt="type=Object[]" src="https://img.shields.io/badge/Object[]-e66e22">
  <br>
  List of configurations for buttons that should be rendered in each row of the table.
</summary>
<br>
<blockquote>

![name=label](https://img.shields.io/badge/label-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The label for the button. It is not rendered but used for accessibility.

![name=icon](https://img.shields.io/badge/icon-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The name of the Tabler icon to use for the button.

![name=onClick](https://img.shields.io/badge/onClick%28row,%20index,%20tableApi%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function to call when the button is clicked.  
It is passed a `row` object containing the data of the row, the `index` of the row (the absolute index from all data, not just the current page), and a `tableApi` parameter, which provides access to the [API](#api) functions defined below.

</blockquote>
</details>

<details>
<summary>
  <img alt="name=selectAction" src="https://img.shields.io/badge/selectAction-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Configuration for the row click/select callback. If omitted, rows will not be clickable.
</summary>
<br>
<blockquote>

![name=label](https://img.shields.io/badge/label-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A label for the hidden select button. It is not rendered but used for accessibility.

![name=onClick](https://img.shields.io/badge/onClick%28row,%20index,%20tableApi%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Function to call when the row is clicked.  
It is passed a `row` object containing the data of the row, the `index` of the row (the absolute index from all data, not just the current page), and a `tableApi` parameter, which provides access to the [API](#api) functions defined below.

</blockquote>
</details>

![name=pageSize](https://img.shields.io/badge/pageSize-gray)
![type=number](https://img.shields.io/badge/number-e66e22)  
The number of rows that should be shown per page. Use `0` to show all rows. Defaults to `10`.

![name=pageSizes](https://img.shields.io/badge/pageSizes-gray)
![type=number[]](https://img.shields.io/badge/number[]-e66e22)  
List of page sizes that the user can select from. Set to an empty array to disable changing the page size. Defaults to `[10, 25, 50]`.

![name=defaultSort](https://img.shields.io/badge/defaultSort-gray)
![type=number|[number,string]](https://img.shields.io/badge/number%20|%20[number,%20string]-e66e22)  
The default sort configuration. It can either be a number representing which column to sort by, or an array containing a number representing the column, and a direction of `asc` or `desc`.

![name=title](https://img.shields.io/badge/title-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The heading text to render above the table.

![name=allowExport](https://img.shields.io/badge/allowExport-gray)
![type=boolean](https://img.shields.io/badge/boolean-e66e22)  
Should the table allow exporting its data to a CSV. Default to `true`. The above `title` will be used as the filename.

<details>
<summary>
  <img alt="name=messages" src="https://img.shields.io/badge/messages-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Map of messages to render during various table states.
</summary>
<br>
<blockquote>

![name=empty](https://img.shields.io/badge/empty-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The text to render when there are no rows in the table. Defaults to `No rows found.`.

![name=loading](https://img.shields.io/badge/loading-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The text to render when the data is loading. Defaults to `Loading...`.

![name=noMatches](https://img.shields.io/badge/noMatches-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
The text to render when no rows match the entered filter query. Defaults to `No rows match your filter.`.

</blockquote>
</details>

</blockquote>
</details>

![name=id](https://img.shields.io/badge/id-gray)
![type=string](https://img.shields.io/badge/string-e66e22)  
A unique id that can be used to retrieve the API of the widget.

### API

![name=getData](https://img.shields.io/badge/getData%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Returns the full list of data used by the table.

![name=reloadData](https://img.shields.io/badge/reloadData%28%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Only available when the table uses an integration for its data. Re-fetches the data from the integration.

![name=addRow](https://img.shields.io/badge/addRow%28row%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Adds the provided `row` to the list of table data, and then re-sorts the table by the current sort, if any.

![name=updateRow](https://img.shields.io/badge/updateRow%28row,%20index%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Updates the row at the provided absolute `index` with the data from the provided `row`.

![name=deleteRow](https://img.shields.io/badge/deleteRow%28index%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
Deletes the row at the provided absolute `index`.

<details>
<summary>
  <img alt="name=actions" src="https://img.shields.io/badge/actions-gray">
  <img alt="type=Object" src="https://img.shields.io/badge/Object-e66e22">
  <br>
  Actions that provide built-in functionality for editing the data.
</summary>
<br>
<blockquote>

![name=add](https://img.shields.io/badge/add%28options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A function that triggers a modal form to be rendered with fields for all columns that provided a `fieldConfig`. Completing the modal form adds a new row to the table.  
It accepts an `options` object which is passed through to the config of the `Subform` widget that's used for this functionality.  
The `options` object can also define a `successMessage` that is shown is the toast when the row is added. Defaults to `Row was added successfully.`.

![name=update](https://img.shields.io/badge/update%28row,%20,index,%20options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A function that triggers a modal form to be rendered with fields for all columns that provided a `fieldConfig`, and uses the provided `row` as the initial values. Completing the modal updates the row at the provided absolute `index`.  
It accepts an `options` object as the third parameter, which is passed through to the config of the `Subform` widget that's used for this functionality.  
The `options` object can also define a `successMessage` that is shown is the toast when the row is added. Defaults to `Row was updated successfully.`.

![name=delete](https://img.shields.io/badge/delete%28index,%20options%29-gray)
![type=Function](https://img.shields.io/badge/Function-e66e22)  
A function that triggers a confirmation modal to verify the user wants to delete the row. Accepting the confirmation deletes the row at the provided absolute `index`.  
It accepts an `options` object as the second parameter, which is passed through to the config of the `openConfirm` utils function that's used for this functionality.  
The `options` object can also define a `successMessage` that is shown is the toast when the row is added. Defaults to `Row was deleted successfully.`.

![name=subform](https://img.shields.io/badge/subform%28options%29-gray)
![type=Object](https://img.shields.io/badge/Object-e66e22)  
A shortcut to the `Subform` widget. Accepts an `options` object, same as one you would pass to the `Subform` widget itself. Using this function doesn't require you to pass a `container` because it will use a container provided by the `Table` widget.

</blockquote>
</details>

### Examples

```js
// Renders a table that displays data from an integration
bundle.widgets.Table({
  container: K('content[Integration Table]').element(),
  config: {
    title: 'Addresses',
    // Configuration for an integration that returns Address submissions
    integration: {
      kappSlug: K('kapp').slug(),
      formSlug: K('form').slug(),
      integrationName: 'Addresses',
      listProperty: 'Data',
      errorProperty: 'Error',
    },
    // Transform the data to a single level map, so that Value aren't nested
    rowTransform: ({ Values, ...row }) => ({ ...row, ...Values }),
    // Define columns
    columns: [
      {
        label: 'Id',
        property: 'Handle',
        // Modify the rendered value of this column to also include the Core State
        displayTransform: (value, row, index) =>
          value + ' (' + row['Core State'] + ')',
        // Don't allow hiding this column
        toggleable: false,
      },
      {
        label: 'Address',
        property: 'Address Line 1',
        // When sorting by Adddress, remove any leading digits before sorting
        sortTransform: value => (value || '').match(/^\d*\s*(.*)$/)[1],
      },
      {
        label: 'Address Line 2',
        property: 'Address Line 2',
        // Hide column by default
        visible: false,
      },
      {
        label: 'City',
        property: 'City',
      },
      {
        label: 'State',
        property: 'State',
        // Add a footer for this column that shows the count of unique states in the table
        footerTransform: function (currentRows, tableApi) {
          const uniqueStates = Object.keys(
            tableApi
              .getData()
              .reduce(
                (result, row) => ({ ...result, [row['State']]: true }),
                {},
              ),
          ).length;
          return `${uniqueStates} States`;
        },
        // Styles the text in this column to be red
        headerCellStyles: { color: 'red' },
        bodyCellStyles: { color: 'red' },
        footerCellStyles: { color: 'red' },
      },
      {
        label: 'Zip Code',
        property: 'Zip Code',
        // Search zip code using starts with when filtering data
        filterOperator: 'startsWith',
      },
    ],
    pageSize: 5,
    pageSizes: [5, 10, 20, 50, 0],
    // Sort using the first column in ascending order by default
    defaultSort: [0, 'asc'],
    messages: {
      loading: 'Loading addresses',
      empty: 'There are no addresses',
      noMatches: 'No addresses match your filter query',
    },
  },
  id: 'addresses-table',
});
```

```js
// Renders a table that displays data from an integration and allows for editing
// the data by editing the submissions using a subform
bundle.widgets.Table({
  container: K('content[Editable Integration Table]').element(),
  config: {
    title: 'Addresses',
    // Configuration for an integration that returns Address submissions
    integration: {
      kappSlug: K('kapp').slug(),
      formSlug: K('form').slug(),
      integrationName: 'Addresses',
      listProperty: 'Data',
      errorProperty: 'Error',
    },
    // Transform the data to a single level map, so that Value aren't nested
    rowTransform: ({ Values, ...row }) => ({ ...row, ...Values }),
    // Define columns
    columns: [
      {
        label: 'Submission Id',
        property: 'Submission Id',
        // We need this data in the row for edit actions, but don't want to show it
        visible: false,
        toggleable: false,
      },
      {
        label: 'Id',
        property: 'Handle',
        // Don't allow hiding this column
        toggleable: false,
      },
      {
        label: 'Address',
        property: 'Address Line 1',
      },
      {
        label: 'Address Line 2',
        property: 'Address Line 2',
        // Hide column by default
        visible: false,
      },
      {
        label: 'City',
        property: 'City',
      },
      {
        label: 'State',
        property: 'State',
      },
      {
        label: 'Zip Code',
        property: 'Zip Code',
      },
    ],
    // Define an action for adding new rows
    addAction: {
      label: 'Add Row',
      onClick: function (tableApi) {
        // When the add row button is clicked, open a subform using the Subform
        // widget so we can allow creating new submissions
        tableApi.actions.subform({
          config: {
            // Provide the kapp and form slugs so we can open a blank form
            kappSlug: kapp('slug'),
            formSlug: 'addresses',
            modalTitle: 'New Address',
            saveLabel: 'Create',
            onSave: function (data, api) {
              // When the save button is clicked, submit the form using the
              // Kinetic form API and provide a callback function
              api.submit(function (result) {
                // Add row to the table so it appears immediately before the
                // table reloads
                tableApi.addRow({
                  // Transform the data of the submission into the structure the
                  // table expects
                  Handle: result.submission.handle,
                  'Core State': result.submission.coreState,
                  'Address Line 1': result.submission.values['Address Line 1'],
                  'Address Line 2': result.submission.values['Address Line 2'],
                  City: result.submission.values['City'],
                  State: result.submission.values['State'],
                  'Zip Code': result.submission.values['Zip Code'],
                });
                // Reload the table data in the background
                tableApi.reloadData();
                // Show success toast
                bundle.utils.toastSuccess({
                  title: 'Address added successfully',
                });
                // Close the subform modal
                api.destroy();
              });
            },
          },
        });
      },
    },
    // Define action buttons for each row of the table
    rowActions: [
      {
        // Define an edit button
        label: 'Edit Row',
        icon: 'pencil',
        onClick: function (row, index, tableApi) {
          // When this button is clicked, open a subform to edit the submission
          // of the current row
          tableApi.actions.subform({
            config: {
              // Provide the submission id so we can open the current submission
              submissionId: row['Submission Id'],
              modalTitle: 'Edit Address',
              saveLabel: 'Update',
              onSave: function (data, api) {
                // When the save button is clicked, submit the form using the
                // Kinetic form API and provide a callback function
                api.submit(function (result) {
                  // Update the row in the table so the changes appear
                  // immediately before the table reloads
                  tableApi.updateRow(
                    {
                      // Transform the data of the submission into the structure the
                      // table expects
                      Handle: result.submission.handle,
                      'Core State': result.submission.coreState,
                      'Address Line 1':
                        result.submission.values['Address Line 1'],
                      'Address Line 2':
                        result.submission.values['Address Line 2'],
                      City: result.submission.values['City'],
                      State: result.submission.values['State'],
                      'Zip Code': result.submission.values['Zip Code'],
                    },
                    index,
                  );
                  // Reload the table data in the background
                  tableApi.reloadData();
                  // Show success toast
                  bundle.utils.toastSuccess({
                    title: 'Address updated successfully',
                  });
                  // Close the subform modal
                  api.destroy();
                });
              },
            },
          });
        },
      },
      {
        // Define a delete button
        label: 'Delete Row',
        icon: 'trash',
        onClick: function (row, index, tableApi) {
          // When this button is clicked, open a confiurmation modal to verify
          bundle.utils.openConfirm({
            title: 'Delete Address',
            description: `Are you sure you want to delete address ${row['Handle']}?`,
            acceptLabel: 'Yes',
            accept: function () {
              // When the confirmation is accepted, call the API to delete the
              // corresponding submission
              K.api(
                'DELETE',
                bundle.apiLocation() + '/submissions/' + row['Submission Id'],
                {
                  complete: function (response) {
                    if (response.status === 200) {
                      // On success of the delete, show a toast
                      bundle.utils.toastSuccess({
                        title: 'Address was successfully deleted',
                      });
                      // Delete the row in the table immediately
                      tableApi.deleteRow(index);
                      // Reload the table data in the background
                      tableApi.reloadData();
                    } else {
                      bundle.utils.toastError({
                        title: 'There was an error deleting the address',
                      });
                    }
                  },
                },
              );
            },
          });
        },
      },
    ],
    pageSize: 5,
    pageSizes: [1, 5, 10, 20, 50, 0],
    // Sort using the first column in ascending order by default
    defaultSort: [0, 'asc'],
    messages: {
      loading: 'Loading addresses',
      empty: 'There are no addresses',
      noMatches: 'No addresses match your filter query',
    },
  },
  id: 'editable-addresses-table',
});
```

```js
// Renders a table that displays static data
bundle.widgets.Table({
  container: K('content[Static Table]').element(),
  config: {
    title: 'Colors',
    // Don't allow filtering the table
    filterable: false,
    // Don't allow changing column visibility
    toggleable: false,
    // Define the data to display in the table
    data: [
      { Name: 'Mindaro', Hex: '#D6FF79' },
      { Name: 'Light Green', Hex: '#B0FF92' },
      { Name: 'Lavender Blush', Hex: '#FFF2F1' },
      { Name: 'Tropical Indigo', Hex: '#A09BE7' },
      { Name: 'Chrysler Blue', Hex: '#5F00BA' },
    ],
    // Define columns
    columns: [
      {
        label: 'Name',
        property: 'Name',
      },
      {
        label: 'Hex Value',
        property: 'Hex',
      },
    ],
    // Define an action when the row itself is clicked
    selectAction: {
      label: 'Select Row',
      onClick: function (row, index, tableApi) {
        // Callback for the row click. Here we show another form element and
        // change its background color to the value from the clicked row.
        K('content[Table Static View Select]').show();
        K('content[Table Static View Select]').element().style.backgroundColor =
          row['Hex'];
      },
    },
    // A page size of 0 shows all rows
    pageSize: 0,
    // Empty pageSizes array will hide the page size selector
    pageSizes: [],
    // Don't allow exports
    allowExport: false,
    messages: { loading: 'Loading colors' },
  },
  id: 'static-table',
});
```

```js
// Renders a table that uses a form field to get initial data, and to store the
// table data in whenever its updated
bundle.widgets.Table({
  container: K('content[Field Table]').element(),
  // Provide the field to tie to this table
  field: K('field[Field Table Data]'),
  config: {
    title: 'Contacts',
    columns: [
      {
        label: 'Name',
        property: 'Name',
        // Make the value of this column a button that updates the row
        onClick: function (row, index, tableApi) {
          // Use the built-in actions to open a modal to update the row
          tableApi.actions.update(row, index);
        },
        // Config for the field corresponding to this column
        fieldConfig: {
          type: 'text',
          required: true,
          label: 'Full Name',
        },
      },
      {
        label: 'Email',
        property: 'Email',
        fieldConfig: {
          type: 'text',
          validate: function (value, data) {
            if (!value && !data['Phone'])
              return ['Either Email or Phone must be provided.'];
          },
        },
      },
      {
        label: 'Phone',
        property: 'Phone',
        fieldConfig: {
          type: 'text',
        },
      },
    ],
    // Define an action for adding new rows
    addAction: {
      label: 'Add Row',
      onClick: function (tableApi) {
        // Use the built-in action to open a modal to add a new row
        tableApi.actions.add();
      },
    },
    // Define actions buttons for each row
    rowActions: [
      {
        // Define a delete button
        label: 'Delete Row',
        icon: 'trash',
        onClick: function (row, index, tableApi) {
          // Use the built-in action to open a confirmation modal before
          // deleting the row
          tableApi.actions.delete(index);
        },
      },
    ],
    messages: {
      loading: 'Loading contacts',
      empty: 'There are no contacts',
      noMatches: 'No contacts match your filter query',
    },
  },
  id: 'field-table',
});
```
