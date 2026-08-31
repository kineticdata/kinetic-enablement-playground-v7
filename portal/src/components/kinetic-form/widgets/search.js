import {
  forwardRef,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import t from 'prop-types';
import {
  Combobox,
  createListCollection,
  useListCollection,
} from '@ark-ui/react/combobox';
import { Portal } from '@ark-ui/react/portal';
import { defineFilter } from '@kineticdata/react';
import { debounce } from 'lodash-es';
import clsx from 'clsx';
import { registerWidget, validateContainer, WidgetAPI } from './index.js';
import { CloseButton } from '../../../atoms/Button.jsx';
import { Icon } from '../../../atoms/Icon.jsx';
import { executeIntegration } from '../../../helpers/api.js';
import { callIfFn } from '../../../helpers/index.js';
import { useData } from '../../../helpers/hooks/useData.js';

const fetchIntegrationOptions = ({
  integration: { kappSlug, formSlug, integrationName, parameters },
  query,
}) =>
  executeIntegration({
    kappSlug,
    formSlug,
    integrationName,
    parameters: parameters.reduce(
      (vals, param) => ({ ...vals, [param.name]: param.value || query }),
      {},
    ),
  });

const filterStaticOptions = ({ options, search: { fields, fn }, query }) => {
  // If filter function is provided, use it to filter the options
  if (typeof fn === 'function') {
    return Promise.resolve({ options: fn(options, query) });
  }
  // Otherwise if query has a value, filter the options based on the search
  // fields config
  if (query) {
    // Build a filter function using `defineFilter`
    const filter = fields
      .reduce(
        (filter, { name, operator }) =>
          filter[operator || 'startsWith'](name, name),
        defineFilter(true, 'or'),
      )
      .end();
    // Build the values object to pass into above filter function
    const values = fields.reduce(
      (values, { name, value }) => ({ ...values, [name]: value || query }),
      {},
    );

    // Return the filtered options using the above filter function
    return Promise.resolve({
      options: options.filter(option => filter(option, values)),
    });
  }
  // Otherwise return all options
  return Promise.resolve({ options });
};

/**
 * @param {SearchWidgetConfig} props
 */
const SearchComponent = forwardRef(
  (
    {
      options,
      search,
      integration,
      initialSelection,
      optionToValue = item => item.value,
      optionToLabel = item => item.label || optionToValue(item),
      optionToTitle = optionToLabel,
      optionToDescription,
      selectionBehavior,
      minSearchLength = 1,
      onChange,
      onFocus,
      onBlur,
      disabled,
      placeholder,
      label,
      icon = 'search',
      messages: {
        // Not enough characters have been typed in to trigger a search.
        short = 'Type to find options.',
        // No results found; custom options not allowed.
        empty = 'No options found.',
        // Searching in progress.
        pending = 'Searching...',
      } = {},
    },
    ref,
  ) => {
    // Is the SearchComponent using an integration
    const usesIntegration = !options && !!integration;
    // Track whether the field is open so we can prevent searching when closed
    const [open, setOpen] = useState(false);
    // State for the selected value object of the search
    const [selection, setSelection] = useState(
      initialSelection ? [initialSelection] : [],
    );
    // State for the value of the search input field
    const [inputValue, setInputValue] = useState(
      (initialSelection && optionToLabel(initialSelection)) || '',
    );
    // State for the debounced query value to use in the search
    const [query, setQuery] = useState(inputValue);
    // State to track previous query value
    const previousQuery = useDeferredValue(query);
    // Function to update the query value with a debounce so we don't fire too
    // many queries as the user types
    const debouncedSetQuery = useMemo(
      () =>
        usesIntegration ? debounce(value => setQuery(value), 300) : setQuery,
      [usesIntegration],
    );
    // Set the query whenever the input changes
    useEffect(() => {
      // Set the input value into the query after a delay, but only if an
      // input value exists. If the input value is empty, the query is set
      // immediately in the change handler so no need to set it again here.
      if (inputValue) debouncedSetQuery(inputValue);
    }, [debouncedSetQuery, inputValue]);
    // Is the min search length met to trigger a search
    const canSearch =
      open && (minSearchLength === 0 || query.length >= minSearchLength);
    // Has input changed since the last query was triggered
    const isQueryStale = query !== inputValue || query !== previousQuery;

    // Parameters for the query
    const params = useMemo(
      () =>
        canSearch
          ? usesIntegration
            ? { integration, query }
            : { options, search, query }
          : null,
      [canSearch, usesIntegration, integration, options, search, query],
    );

    const { loading, response } = useData(
      usesIntegration ? fetchIntegrationOptions : filterStaticOptions,
      params,
    );
    const error = response?.error;
    const data = usesIntegration
      ? response?.[integration.listProperty]
      : response?.options;

    // Only show loading state for integration mode, because static search will
    // be too fast and will just flash the loading state which looks bad.
    const isLoading = usesIntegration && (loading || isQueryStale);

    // Define the collection to use for the combobox field
    const { collection, set } = useListCollection({
      initialItems: (open ? !isLoading && data : selection) || [],
      itemToValue: optionToValue,
      itemToString: optionToLabel,
    });
    // Update collection when data changes
    useEffect(() => {
      set((open ? !isLoading && data : selection) || []);
    }, [set, open, isLoading, data, selection]);

    // State for disabled state of the field
    const [isDisabled, setIsDisabled] = useState(!!disabled);

    // Determine if there is a status message we should show
    const statusMessage = isLoading
      ? pending
      : !canSearch
        ? short
        : data?.length === 0
          ? empty
          : null;

    // Handler for when the selection is changed
    const handleChange = useCallback(
      ({ value, items }) => {
        // Remove proxy wrapper from items
        const selectedItems = structuredClone(items);
        // Set value state
        setSelection(selectedItems);
        // Call onChange function if one was provided
        callIfFn(onChange, undefined, [selectedItems[0], value[0]]);
      },
      [onChange],
    );

    // API function for setting the selection
    const setSelectionAPI = useCallback(
      v => {
        const item = v && typeof v === 'object' ? v : undefined;
        const value = (item && optionToValue(item)) || undefined;
        handleChange({
          value: value ? [value] : [],
          items: item ? [item] : [],
        });
      },
      [handleChange, optionToValue],
    );

    // Define API ref
    const api = useRef({
      enable: () => setIsDisabled(false),
      disable: () => setIsDisabled(true),
      getSelection: () => selection[0],
      setSelection: setSelectionAPI,
    });
    // Update API ref when its contents change
    useEffect(() => {
      Object.assign(api.current, {
        getSelection: () => selection[0],
        setSelection: setSelectionAPI,
      });
    }, [selection, setSelectionAPI]);

    return (
      <WidgetAPI ref={ref} api={api.current}>
        <Combobox.Root
          onOpenChange={({ open }) => setOpen(open)}
          collection={collection}
          onInputValueChange={({ inputValue }) => {
            setInputValue(inputValue);
            // If the input value is empty or the search is closed, set the
            // query immediately
            if (!inputValue || !open) setQuery(inputValue);
          }}
          value={selection.map(optionToValue)}
          onValueChange={handleChange}
          selectionBehavior={selectionBehavior}
          disabled={isDisabled}
          placeholder={placeholder}
          className="field w-full"
        >
          <Combobox.Context>
            {ctx => {
              const showClear =
                ctx.inputValue && ctx.inputValue === ctx.valueAsString;

              return (
                <>
                  {label && <Combobox.Label>{label}</Combobox.Label>}
                  <Combobox.Control className={clsx('relative')}>
                    <Combobox.Input
                      className={clsx('relative', {
                        '!pl-12': !!icon,
                        '!pr-12': !!showClear,
                      })}
                      onFocus={e => {
                        if (!ctx.open && !ctx.inputValue) ctx.setOpen(true);
                        callIfFn(onFocus, undefined, [e]);
                      }}
                      onBlur={onBlur}
                    />
                    {icon && (
                      <Icon
                        name={'search'}
                        className="absolute left-4 top-0 text-base-content/50 my-2.5 z-1"
                      />
                    )}
                    {!isDisabled && (
                      <Combobox.ClearTrigger
                        asChild
                        className={clsx(
                          'absolute right-0 top-0 z-1',
                          !showClear && 'hidden',
                        )}
                        onClick={() => setTimeout(() => ctx.setOpen(true), 0)}
                        tabIndex={0}
                      >
                        <CloseButton />
                      </Combobox.ClearTrigger>
                    )}
                  </Combobox.Control>
                  <Portal>
                    <Combobox.Positioner>
                      <Combobox.Content
                        className={clsx(
                          'py-2 bg-base-100 border border-base-300 rounded-sm min-w-[10rem] shadow-lg z-30',
                        )}
                      >
                        <Combobox.ItemGroup>
                          {error?.message && (
                            <div className="py-1.5 px-4 min-w-full text-base-content/60">
                              <span className="kstatus kstatus-error mr-2"></span>
                              {error?.message}
                            </div>
                          )}
                          {statusMessage && (
                            <div className="py-1.5 px-4 min-w-full text-base-content/60">
                              {statusMessage}
                            </div>
                          )}
                          {collection.items.map(item => (
                            <Combobox.Item
                              key={optionToValue(item)}
                              item={optionToValue(item)}
                              className={clsx(
                                'flex flex-col gap-1 items-stretch py-1.5 px-4 min-w-full hover:bg-base-200 data-[highlighted]:bg-base-200',
                              )}
                            >
                              <Combobox.ItemText>
                                {optionToTitle(item)}
                              </Combobox.ItemText>
                              {optionToDescription && (
                                <Combobox.ItemText className="text-sm text-base-content/60">
                                  {optionToDescription(item)}
                                </Combobox.ItemText>
                              )}
                            </Combobox.Item>
                          ))}
                        </Combobox.ItemGroup>
                      </Combobox.Content>
                    </Combobox.Positioner>
                  </Portal>
                </>
              );
            }}
          </Combobox.Context>
        </Combobox.Root>
      </WidgetAPI>
    );
  },
);

SearchComponent.propTypes = {
  options: t.arrayOf(t.object),
  search: t.shape({
    fields: t.arrayOf(
      t.shape({
        name: t.string,
        operator: t.string,
        value: t.any,
      }),
    ),
    fn: t.func,
  }),
  integration: t.shape({
    kappSlug: t.string,
    formSlug: t.string,
    integrationName: t.string,
    listProperty: t.string,
    parameters: t.arrayOf(
      t.shape({
        name: t.string,
        value: t.any,
      }),
    ),
  }),
  initialSelection: t.object,
  optionToValue: t.func,
  optionToLabel: t.func,
  optionToTitle: t.func,
  optionToDescription: t.func,
  selectionBehavior: t.oneOf(['replace', 'clear', 'preserve']),
  minSearchLength: t.number,
  onChange: t.func,
  onFocus: t.func,
  onBlur: t.func,
  disabled: t.bool,
  placeholder: t.string,
  label: t.string,
  icon: t.string,
  messages: t.shape({
    short: t.string,
    empty: t.string,
    pending: t.string,
  }),
};

/**
 * Additional validations to be performed on the configurations of this widget.
 */
const validateConfig = config => {
  let valid = true;

  // Make sure either options or integration data are provided
  if (!config.options && !config.integration) {
    console.error(
      'Search Widget Error: You must provide either a list of static `options` or an `integration` object that defines what integration to use.',
    );
    valid = false;
  }

  // Validate static options
  if (config.options) {
    if (
      !Array.isArray(config.options) ||
      config.options.some(o => typeof o !== 'object')
    ) {
      console.error(
        'Search Widget Error: The `options` property must be an array of objects.',
      );
      valid = false;
    }
    if (typeof config.search !== 'object') {
      console.error(
        'Search Widget Error: The `search` property must be provided when using static options.',
      );
      valid = false;
    } else if (
      !Array.isArray(config.search.fields) &&
      typeof config.search.fn !== 'function'
    ) {
      console.error(
        'Search Widget Error: The `search` property must either contain a `fields` array defining which properties of the options to search, or a `fn` function that performs the filtering.',
      );
      valid = false;
    } else if (Array.isArray(config.search.fields)) {
      if (config.search.fields.some(f => !f.name)) {
        console.error(
          'Search Widget Error: The `search.fields` property must be an array of objects that defines the `name` of each field that should be searched.',
        );
        valid = false;
      } else if (
        config.search.fields.some(
          f =>
            f.operator &&
            !['equals', 'startsWith', 'matches'].includes(f.operator),
        )
      ) {
        console.error(
          "Search Widget Error: The `search.fields` property can only use the following operators: 'equals', 'startsWith', or 'matches'.",
        );
        valid = false;
      }
    }
  }

  //Validate integration options
  if (config.integration) {
    if (config.options) {
      console.error(
        'Search Widget Error: The `integration` configuration will be ignored because `options` were also provided.',
      );
      valid = false;
    } else if (
      !config.integration.kappSlug ||
      !config.integration.integrationName ||
      !config.integration.listProperty
    ) {
      console.error(
        'Search Widget Error: The `integration.kappSlug`, `integration.integrationName`, and `integration.listProperty` properties are all required when using an integration.',
      );
      valid = false;
    } else if (
      Array.isArray(config.integration.parameters) &&
      config.integration.parameters.some(f => !f.name)
    ) {
      console.error(
        'Search Widget Error: The `integration.parameters` property must be an array of objects that defines the `name` of each parameter that should be passed to the integration.',
      );
      valid = false;
    }
  }

  return valid;
};

/**
 * Function that initializes a Search widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {SearchWidgetConfig} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Markdown.get` function.
 */
export const Search = ({ container, config, id } = {}) => {
  if (validateContainer(container, 'Search') && validateConfig(config)) {
    return registerWidget(Search, {
      container,
      Component: SearchComponent,
      props: { ...config },
      id,
    });
  }
  return Promise.reject(
    'The Search widget parameters are invalid. See the console for more details.',
  );
};

/**
 * @typedef {Object} SearchWidgetConfig
 * @property {Object[]} [options] List of objects to use as the static options
 *  for the search functionality.
 * @property {StaticSearch} [search] Search configuration for how the user
 *  typed in value should be used in filtering the results when static options
 *  are provided.
 * @property {IntegrationSearch} [integration] Data defining the
 *  integration to use for retrieving data for the search functionality.
 * @property {Object} [initialSelection] The option object that should be
 *  initially selected when the widget loads.
 * @property {Function} [optionToValue] Function that takes the current option
 *  and returns a value that can uniquely identify this option.
 * @property {Function} [optionToLabel] Function that takes the current option
 *  and returns a label that is rendered in the field when the option is
 *  selected.
 * @property {Function} [optionToTitle] Function that takes the current option
 *  and returns a title that is rendered in the list of options when the option
 *  is shown. Defaults to the `optionToLabel`.
 * @property {Function} [optionToDescription] Function that takes the current
 *  option and returns a description that is rendered in the list of options
 *  when the option is shown. Defaults to the `null`.
 * @property {'replace'|'clear'|'preserve'} [selectionBehavior=replace] Behavior
 *  of the field when an option is selected: 'replace' (default) will show the
 *  option label, 'clear' will empty the field, and 'preserve' will keep the
 *  user's query.
 * @property {number} [minSearchLength=1] The number of character that need to
 *  be typed in before options are shown.
 * @property {Function} onChange Function called when the value is changed.
 * @property {Function} [onFocus] Function called when the field is focused.
 * @property {Function} [onBlur] Function called when the field is blurred.
 * @property {boolean} [disabled=false] Should the field be disabled.
 * @property {string} [placeholder] Placeholder to render in the field when
 *  it is empty.
 * @property {string} [icon=search] Name of icon to render in the field.
 * @property {Object} [messages] Object of status messages to display during
 *  various states.
 * @property {string} [messages.short] Message to display when there are not
 *  enough character typed in to trigger a search.
 * @property {string} [messages.empty] Message to display when there are no
 *  results matching the query.
 * @property {string} [messages.pending] Message to display when options are
 *  being retrieved or filtered.
 */

/**
 * @typedef {Object} IntegrationSearch
 * @property {string} kappSlug The slug of the kapp in which the integration
 *  exists.
 * @property {string} [formSlug] The slug of the form in which the integration
 *  exists. If omitted, a kapp integration will be used.
 * @property {string} integrationName The name of the integration to use.
 * @property {string} listProperty The name of the output property of the
 *  integration response that contains the list data to use.
 * @property {IntegrationSearchParameter[]} parameters A list of parameters
 *  that should be passed into the integration.
 */

/**
 * @typedef {Object} IntegrationSearchParameter
 * @property {string} name The name of the parameter to pass into the
 *  integration.
 * @property {any} [value] The value to set the parameter to. If omitted, the
 *  typed in user query will be used.
 */

/**
 * @typedef {Object} StaticSearch
 * @property {StaticSearchParameter[]} [fields] A list of fields that should be
 *  searched in the static list of options. This is ignored if the `fn`
 *  property is provided.
 * @property {Function} [fn] A function to use for filtering the options based
 *  on the user query. It takes the list of options and the search query, and
 *  returns a filtered list of options.
 */

/**
 * @typedef {Object} StaticSearchParameter
 * @property {string} name The name of the property to search.
 * @property {any} [value] The value that the option must match to be accepted.
 *  If omitted, the typed in user query will be used.
 * @property {'equals'|'matches'|'startsWith'} [operator] The operation type to
 *  use when searching through the options. Defaults to "startsWith".
 */
