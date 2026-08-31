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
import { debounce } from 'lodash-es';
import {
  registerWidget,
  validateContainer,
  validateField,
  WidgetAPI,
} from './index.js';
import { Icon } from '../../../atoms/Icon.jsx';
import { executeIntegration } from '../../../helpers/api.js';
import { callIfFn, downloadCSV } from '../../../helpers/index.js';
import { useData } from '../../../helpers/hooks/useData.js';
import clsx from 'clsx';
import { Tooltip } from '../../../atoms/Tooltip.jsx';
import { openConfirm } from '../../../helpers/confirm.js';
import { toastError, toastSuccess } from '../../../helpers/toasts.js';
import { Menu } from '../../../atoms/Menu.jsx';
import { Popover } from '../../../atoms/Popover.jsx';
import { Subform } from './subform.js';

const TableRenderer = ({
  currentTableData,
  currentColumns,
  // State
  loading,
  error,
  title,
  messages,
  allowExport,
  // Actions
  rowActions,
  addAction,
  selectAction,
  // Column controls
  columnData,
  toggleable,
  toggleColumn,
  // Filtering
  filterable,
  query,
  queryValue,
  onQueryChange,
  // Sorting
  sortable,
  sortColumn,
  sortDirection,
  setSortData,
  // Pagination
  pageSize,
  setPageSize,
  pageSizes,
  count,
  filteredCount,
  pageCount,
  pageNumber,
  goToPage,
  // APIs
  formContainerRef,
  tableApi,
}) => {
  const filterRef = useRef();
  const [isFilterFocused, setFilterFocused] = useState(
    filterRef.current === document.activeElement,
  );

  const commonCellClasses = clsx(
    'bg-base-100 first:rounded-l-box first:border-l-[0.75rem] last:rounded-r-box last:border-r-[0.75rem] border-transparent px-3 py-2.5 font-medium h-16',
    'group-has-[td.selectable]:group-[&:not(:has(button:hover))]:group-hover:bg-base-200',
    'group-has-[td.selectable]:group-[&:not(:has(button:hover))]:group-hover:cursor-pointer',
  );

  const colSpan =
    currentColumns.length + (rowActions ? 1 : 0) + (selectAction ? 1 : 0);

  const footerData = useMemo(() => {
    if (currentTableData && columnData.some(col => col.footerTransform)) {
      const currentRows = currentTableData?.map(row => row.raw);
      return columnData.reduce(
        (footer, col) => ({
          ...footer,
          [col.property]: callIfFn(col.footerTransform, null, [
            currentRows,
            tableApi,
          ]),
        }),
        {},
      );
    }
    return undefined;
  }, [columnData, currentTableData, tableApi]);

  return (
    <div
      className={clsx(
        // Common styles
        'flex flex-col bg-base-200',
        // Mobile first styles
        'gap-2 py-5 px-6 max-md:-mx-6 w-screen',
        // Non mobile styles
        'md:gap-3 md:rounded-box md:px-5 md:w-full',
      )}
    >
      <div
        className={clsx(
          // Common styles
          'flex justify-end items-center flex-wrap',
          // Mobile first styles
          'gap-2',
          // Non mobile styles
          'lg:gap-5',
        )}
      >
        <span className="h4 mr-auto text-balance flex-1 max-md:min-w-full">
          {title}
        </span>
        {filterable && (
          <Tooltip
            content="Filter"
            position="top"
            alignment="middle"
            disabled={!!query || isFilterFocused}
          >
            <div
              slot="trigger"
              className={clsx('group relative focus-within:max-sm:w-full', {
                'is-filtered max-sm:w-full': query,
              })}
            >
              <input
                type="text"
                ref={filterRef}
                value={query}
                onChange={onQueryChange}
                autoComplete="off"
                aria-label="Filter"
                className={clsx(
                  'kbtn kbtn-circle kbtn-lg kbtn-outline border-base-300 bg-base-100 md:transition-all',
                  'text-left max-md:text-sm font-medium',
                  'pl-11 pr-0.5 group-focus-within:px-12 group-[.is-filtered]:px-12',
                  'group-focus-within:w-64 group-[.is-filtered]:w-64',
                  'max-sm:group-focus-within:w-full max-sm:group-[.is-filtered]:w-full',
                  'group-focus-within:cursor-auto group-[.is-filtered]:cursor-auto',
                  'not-group-focus-within:not-group-[.is-filtered]:hover:bg-base-300',
                )}
                onFocus={() => setFilterFocused(true)}
                onBlur={() => setFilterFocused(false)}
                onKeyDown={e => {
                  e.key === 'Enter' && e.preventDefault();
                }}
                placeholder="Filter"
              />
              <Icon
                name="search"
                className={clsx(
                  'absolute top-0 pointer-events-none my-3 z-1',
                  'left-3 group-focus-within:left-4 group-[.is-filtered]:left-4',
                  'text-base-content group-focus-within:text-base-content/60 group-[.is-filtered]:text-base-content/60',
                )}
              />
              {query && (
                <button
                  className="kbtn kbtn-sm kbtn-circle kbtn-ghost absolute right-0 top-0 m-2 z-1"
                  aria-label="Clear Filter"
                  onClick={() => {
                    onQueryChange();
                    filterRef.current?.focus();
                  }}
                >
                  <Icon name="x" size={20} />
                </button>
              )}
            </div>
          </Tooltip>
        )}
        {toggleable && (
          <Tooltip content="Columns" position="top" alignment="middle">
            <span slot="trigger">
              <Popover alignment="end">
                <button
                  slot="trigger"
                  type="button"
                  className="kbtn kbtn-circle kbtn-lg kbtn-outline kbtn-base"
                  aria-label="Columns"
                >
                  <Icon name="layout-columns" />
                </button>
                <div slot="content" className="flex-c-st gap-2">
                  <div className="flex-bc gap-3">
                    <span className="h4 text-balance">Columns</span>
                    <Popover.CloseTrigger asChild>
                      <button className="kbtn kbtn-sm kbtn-circle kbtn-ghost absolute right-2 top-2">
                        <Icon name="x" size={20} />
                      </button>
                    </Popover.CloseTrigger>
                  </div>

                  {columnData.map(col =>
                    col.visible || col.toggleable ? (
                      <div className="w-full" key={col.property}>
                        <label
                          htmlFor={`${col.property}-vis`}
                          className="unstyled relative flex-bc flex-row-reverse w-full"
                        >
                          <input
                            id={`${col.property}-vis`}
                            type="checkbox"
                            disabled={!col.toggleable}
                            checked={col.visible}
                            onChange={() => toggleColumn(col.property)}
                            aria-label="Set column visibility"
                            className="peer unstyled ktoggle ktoggle-primary"
                          />
                          <span
                            className={clsx(
                              'font-medium peer-disabled:text-base-content/60 truncate mr-2',
                            )}
                          >
                            {col.label}
                          </span>
                        </label>
                      </div>
                    ) : null,
                  )}
                </div>
              </Popover>
            </span>
          </Tooltip>
        )}
        {allowExport !== false && (
          <Tooltip content="Export" position="top" alignment="middle">
            <button
              slot="trigger"
              type="button"
              className="kbtn kbtn-circle kbtn-lg kbtn-outline kbtn-base"
              aria-label="Export"
              onClick={() => {
                const data = tableApi.getData();
                if (data?.length > 0) {
                  downloadCSV(tableApi.getData(), title || 'TableData');
                } else {
                  toastError({
                    title: "The table doesn't have any data to export.",
                  });
                }
              }}
            >
              <Icon name="table-down" />
            </button>
          </Tooltip>
        )}
        {tableApi.reloadData && (
          <Tooltip content="Reload" position="top" alignment="middle">
            <button
              slot="trigger"
              type="button"
              className={clsx(
                'kbtn kbtn-circle kbtn-lg kbtn-outline kbtn-base',
                {
                  'animate-spin': loading,
                },
              )}
              aria-label="Reload"
              onClick={tableApi.reloadData}
            >
              <Icon name="refresh" />
            </button>
          </Tooltip>
        )}
        {addAction && (
          <button
            type="button"
            className="kbtn kbtn-lg kbtn-primary max-lg:kbtn-circle"
            onClick={() => addAction.onClick(tableApi)}
            aria-label={addAction.label || 'Add Row'}
          >
            <Icon name={addAction.icon || 'plus'}></Icon>
            <span className="max-lg:hidden">{addAction.label}</span>
          </button>
        )}
      </div>

      <div
        className={clsx(
          // Common styles
          'px-5 -mx-5 overflow-x-auto scrollbar',
          // Mobile first styles
          'py-2 -my-2',
          // Non-mobile styles
          'md:py-3 md:-my-3',
        )}
      >
        <table className="w-full border-separate border-spacing-x-0 border-spacing-y-3 -my-2 md:-my-3">
          <thead>
            <tr className={''}>
              {selectAction && <th className={clsx('selectable w-3')}></th>}
              {currentColumns.map((column, index) => {
                return (
                  <th
                    key={column.property}
                    className={clsx(
                      'group relative bg-transparent p-3 font-medium text-left whitespace-nowrap',
                      {
                        'text-base-content': sortColumn === column.property,
                        'text-base-content/60': sortColumn !== column.property,
                      },
                      column.headerCellClass,
                    )}
                    style={column.headerCellStyles}
                    scope="col"
                  >
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <>
                        <button
                          className="peer absolute inset-0 focus-ring rounded-box"
                          type="button"
                          onClick={() =>
                            setSortData([
                              column.property,
                              sortColumn !== column.property ||
                              sortDirection !== 'asc'
                                ? 'asc'
                                : 'desc',
                            ])
                          }
                          aria-label={`Sort ${sortDirection !== 'asc' ? 'ascending' : 'descending'} by column ${column.label || index}`}
                        />
                        <Icon
                          className={clsx(
                            'inline-block',
                            {
                              'opacity-0': sortColumn !== column.property,
                              'opacity-100': sortColumn === column.property,
                            },
                            'group-hover:opacity-100 peer-focus:opacity-100',
                          )}
                          name={
                            sortColumn === column.property
                              ? sortDirection === 'asc'
                                ? 'arrow-narrow-up'
                                : 'arrow-narrow-down'
                              : 'arrows-down-up'
                          }
                          size={20}
                        />
                      </>
                    )}
                  </th>
                );
              })}
              {rowActions && (
                <th className={clsx('bg-transparent p-3 w-3')}></th>
              )}
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr className={'group rounded-box'}>
                <td
                  colSpan={colSpan}
                  className={clsx(commonCellClasses, 'text-base-content/60')}
                >
                  <span className="kstatus kstatus-error mr-2"></span>
                  {error}
                </td>
              </tr>
            ) : !currentTableData ? (
              <tr className={'group rounded-box'}>
                <td
                  colSpan={colSpan}
                  className={clsx(
                    commonCellClasses,
                    'text-base-content/60 italic',
                  )}
                >
                  {messages?.loading || 'Loading...'}
                </td>
              </tr>
            ) : count === 0 ? (
              <tr className={'group rounded-box'}>
                <td
                  colSpan={colSpan}
                  className={clsx(
                    commonCellClasses,
                    'text-base-content/60 italic',
                  )}
                >
                  {messages?.empty || 'No rows found.'}
                </td>
              </tr>
            ) : queryValue && filteredCount === 0 ? (
              <tr className={'group rounded-box'}>
                <td
                  colSpan={colSpan}
                  className={clsx(
                    commonCellClasses,
                    'text-base-content/60 italic',
                  )}
                >
                  {messages?.noMatches || 'No rows match your filter.'}
                </td>
              </tr>
            ) : null}
            {currentTableData?.map(row => (
              <tr
                key={row.key}
                data-test-id={row.raw.id || undefined}
                className={clsx(
                  'group rounded-box',
                  'has-[td.selectable>button:focus]:outline-2',
                  'has-[td.selectable>button:focus]:outline-solid',
                )}
                onClick={
                  selectAction
                    ? () => {
                        callIfFn(selectAction.onClick, null, [
                          row.raw,
                          row.index,
                          tableApi,
                        ]);
                      }
                    : undefined
                }
              >
                {selectAction && (
                  <td className={clsx(commonCellClasses, '!p-0 selectable')}>
                    <button
                      type="button"
                      aria-label={selectAction.label || 'Select Row'}
                      className="sr-only"
                      onClick={e => {
                        e.stopPropagation();
                        callIfFn(selectAction.onClick, null, [
                          row.raw,
                          row.index,
                          tableApi,
                        ]);
                      }}
                    />
                  </td>
                )}
                {currentColumns.map(column => (
                  <td
                    key={column.property}
                    className={clsx(
                      commonCellClasses,
                      {
                        '!px-0.25': column.onClick,
                      },
                      column.bodyCellClass,
                    )}
                    style={column.bodyCellStyles}
                  >
                    {column.onClick ? (
                      <button
                        type="button"
                        className="kbtn kbtn-lg kbtn-ghost underline"
                        onClick={e => {
                          e.stopPropagation();
                          column.onClick(row.raw, row.index, tableApi);
                        }}
                      >
                        {row.columns[column.property]?.displayValue}
                      </button>
                    ) : (
                      row.columns[column.property]?.displayValue
                    )}
                  </td>
                ))}
                {rowActions && (
                  <td className={clsx(commonCellClasses, '!px-0.25')}>
                    <span className="flex gap-1">
                      {rowActions.map((action, i) => (
                        <button
                          type="button"
                          className="kbtn kbtn-lg kbtn-ghost kbtn-circle"
                          key={`${row.key}-action-${i}`}
                          aria-label={action.label}
                          onClick={e => {
                            e.stopPropagation();
                            action.onClick(row.raw, row.index, tableApi);
                          }}
                        >
                          <Icon name={action.icon} />
                        </button>
                      ))}
                    </span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          {footerData && (
            <tfoot>
              <tr>
                {selectAction && <th className={clsx('selectable w-3')}></th>}
                {currentColumns.map(column => {
                  return (
                    <th
                      key={column.property}
                      className={clsx(
                        'bg-transparent text-text-content/60 px-3 py-1.5 font-normal text-sm text-left',
                        column.footerCellClass,
                      )}
                      style={column.footerCellStyles}
                    >
                      {footerData[column.property]}
                    </th>
                  );
                })}
                {rowActions && (
                  <th className={clsx('bg-transparent p-3 w-3')}></th>
                )}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div
        className={clsx(
          'flex-cc gap-2 lg:gap-5 bg-base-100 px-3 py-2.5 font-medium rounded-box',
        )}
      >
        <span className="max-md:hidden flex-1 text-balance">
          Showing: {queryValue ? `${filteredCount} of ${count}` : count}
        </span>

        <button
          type="button"
          className="kbtn kbtn-lg kbtn-ghost kbtn-circle ml-auto"
          disabled={pageNumber <= 1}
          onClick={() => goToPage(1)}
          aria-label="Go to first page"
        >
          <Icon name="chevron-left-pipe" />
        </button>
        <button
          type="button"
          className="kbtn kbtn-lg kbtn-ghost kbtn-circle"
          disabled={pageNumber <= 1}
          onClick={() => goToPage(pageNumber - 1)}
          aria-label="Go to previous page"
        >
          <Icon name="chevron-left" />
        </button>
        <Menu
          items={Array.from(Array(pageCount).keys()).map(pageIndex => ({
            label: `${pageIndex + 1}`,
            onClick: () => goToPage(pageIndex + 1),
          }))}
          alignment="middle"
        >
          <button
            slot="trigger"
            type="button"
            className="kbtn kbtn-lg kbtn-ghost rounded-full"
            aria-label="Go To Page"
          >
            {currentTableData ? (
              `${pageNumber}/${pageCount}`
            ) : (
              <Icon name="loader-2" className="animate-spin"></Icon>
            )}
          </button>
        </Menu>
        <button
          type="button"
          className="kbtn kbtn-lg kbtn-ghost kbtn-circle"
          disabled={pageNumber >= pageCount}
          onClick={() => goToPage(pageNumber + 1)}
          aria-label="Go to next page"
        >
          <Icon name="chevron-right" />
        </button>
        <button
          type="button"
          className="kbtn kbtn-lg kbtn-ghost kbtn-circle mr-auto"
          disabled={pageNumber >= pageCount}
          onClick={() => goToPage(pageCount)}
          aria-label="Go to last page"
        >
          <Icon name="chevron-right-pipe" />
        </button>

        <span className="max-md:hidden flex-1 text-right">
          {pageSizes?.length > 1 && (
            <>
              Rows per page{' '}
              <Menu
                items={pageSizes.map(size => ({
                  label: size ? `${size}` : 'All',
                  onClick: () => setPageSize(size),
                }))}
                alignment="end"
              >
                <button
                  slot="trigger"
                  type="button"
                  className="kbtn kbtn-lg kbtn-soft rounded-full"
                  aria-label="Change Page Size"
                >
                  {pageSize || 'All'}
                  <Icon name="chevron-down" />
                </button>
              </Menu>
            </>
          )}
        </span>
      </div>
      <div ref={formContainerRef} className="empty:hidden" />
    </div>
  );
};

// Retrieves and transforms the data used in the table
const fetchTableData = ({ field, data, integration, rowTransform }) => {
  // Build a transformer function if a rowTransform was provided
  const transformer = rows =>
    Array.isArray(rows) && typeof rowTransform === 'function'
      ? rows.map(rowTransform)
      : rows;

  // If static data is provided, transform and return it
  if (Array.isArray(data)) {
    return Promise.resolve({ rows: transformer(data) });
  }
  // Otherwise, execute the integration, transform the response and return it
  else if (integration) {
    const {
      kappSlug,
      formSlug,
      integrationName,
      parameters = {},
      listProperty,
      errorProperty,
    } = integration || {};

    return executeIntegration({
      kappSlug,
      formSlug,
      integrationName,
      parameters,
    }).then(response => {
      const rowData = response?.[listProperty];
      return {
        rows: transformer(rowData),
        error: response?.error || response?.[errorProperty],
      };
    });
  } else if (field) {
    try {
      const value = field.value();
      return Promise.resolve({ rows: value ? JSON.parse(value) : [] });
    } catch {
      return Promise.resolve({
        error: 'The data for this table is not valid JSON.',
      });
    }
  }
  return Promise.resolve({ rows: [] });
};

// Processes the table data to perform column transformations
const processTableData = (rows, columns) =>
  rows?.map((row, index) => ({
    raw: row,
    columns: columns.reduce((record, col) => {
      const value = row[col.property];
      return {
        ...record,
        [col.property]: {
          value,
          displayValue: callIfFn(col.displayTransform, value, [value, row]),
          sortValue: callIfFn(col.sortTransform, value, [value, row]),
          filterValue: callIfFn(col.filterTransform, value, [value, row]),
        },
      };
    }, {}),
    // Create a unique key for each row for dom rendering
    key: `${new Date().getTime()}-${index}`,
    // Store index so we can determine the index of any row, even when filtered
    index,
  }));

// Adds an index to all the data rows
const indexTableData = rows => rows?.map((row, index) => ({ ...row, index }));

// Creates a sorter function for sorting by a given column
const createRowSorter = (sortable, sortColumn, sortDirection = 'asc') => {
  if (sortColumn) {
    return (a, b) =>
      a.columns[sortColumn]?.sortValue < b.columns[sortColumn]?.sortValue
        ? sortDirection === 'asc'
          ? -1
          : 1
        : a.columns[sortColumn]?.sortValue > b.columns[sortColumn]?.sortValue
          ? sortDirection === 'asc'
            ? 1
            : -1
          : 0;
  }
  return undefined;
};

// Creates a filter function for filtering data based on the column config
const createDataFilter = (filterable, columns) => {
  // Find filterable columns
  const filterableColumns = columns.filter(
    column => column.filterable !== false,
  );
  // Only create filter function is the filterable flag is true and there is at
  // least one filterable column
  if (filterable && filterableColumns.length > 0) {
    return (query, rows) =>
      // Filter each row if a query is provided
      query
        ? rows.filter(row =>
            // by checking that at least only column matches the query
            filterableColumns.some(column => {
              // Get the value used for filtering
              const value = row.columns[column.property]?.filterValue;

              return typeof column.filterFn === 'function'
                ? // If filterFn is a function, call it to perform the filtering
                  column.filterFn(query, value, row.raw)
                : // Otherwise, filter based on the filterOperator value
                  column.filterOperator === 'equals'
                  ? value?.toLowerCase() === query.toLowerCase()
                  : column.filterOperator === 'startsWith'
                    ? !!value?.toLowerCase().startsWith(query.toLowerCase())
                    : !!value?.toLowerCase().includes(query.toLowerCase());
            }),
          )
        : rows;
  }
  return undefined;
};

export const TableComponent = forwardRef(
  (
    {
      field,
      data,
      integration,
      rowTransform,
      onDataError,
      onDataSuccess,
      columns,
      rowActions,
      addAction,
      selectAction,
      sortable = true,
      filterable = true,
      toggleable = true,
      title,
      pageSize = 10,
      pageSizes,
      defaultSort = [],
      allowExport,
      messages,
    },
    ref,
  ) => {
    /* DATA FETCH *************************************************************/

    // Timestamp for tracking when the source data was last fetched
    const [lastDataUpdate, setLastDataUpdate] = useState(null);

    // Get the data and transform it if necessary
    const params = useMemo(
      () => ({ field, data, integration, rowTransform }),
      [field, data, integration, rowTransform],
    );
    const {
      loading,
      response,
      actions: { reloadData },
    } = useData(fetchTableData, params);
    const { error, rows } = response || {};

    /* SORTING ****************************************************************/

    // State for sort order and direction
    const [[sortColumn, sortDirection], setSortData] = useState([
      typeof defaultSort === 'number'
        ? columns?.[defaultSort]?.property
        : typeof defaultSort[0] === 'number'
          ? columns?.[defaultSort[0]]?.property
          : undefined,
      defaultSort?.[1] || 'asc',
    ]);
    const rowSorter = useMemo(
      () => createRowSorter(sortable, sortColumn, sortDirection),
      [sortable, sortColumn, sortDirection],
    );

    /* DATA PROCESSING ********************************************************/

    // Source data for the table
    const [tableData, setTableData] = useState(null);
    // Update table data and add an index to all the rows
    const updateTableData = useCallback(
      dataOrFn =>
        setTableData(data =>
          indexTableData(callIfFn(dataOrFn, dataOrFn, [data])),
        ),
      [],
    );
    // Ref for exposing tableData to the widget API
    const tableDataRef = useRef(tableData);

    useEffect(() => {
      if (tableData) {
        const rawData = tableData.map(row => row.raw);
        // Update ref for API function
        tableDataRef.current = rawData;
        // Update kinetic field value if a field was provided
        if (field) field.value(JSON.stringify(rawData));
      }
    }, [tableData, field]);

    useEffect(() => {
      if (error) {
        // Trigger error callback if error while fetching data
        callIfFn(onDataError, null, [error]);
        // Clear the table data
        setTableData(null);
      }
    }, [error, onDataError]);

    useEffect(() => {
      if (rows) {
        // Trigger success callback when data fetch is successful
        callIfFn(onDataSuccess, null, [rows]);
        // Set the table data after processing it to generate the needed values
        // for rendering, sorting, and filtering
        updateTableData(processTableData(rows, columns));
        // Set timestamp so we can re-sort the new data
        setLastDataUpdate(new Date().getTime());
      }
    }, [rows, columns, onDataSuccess, updateTableData]);

    useEffect(() => {
      // Sort data when it's fetched or when the sort changes
      if (rowSorter) updateTableData(data => data?.toSorted(rowSorter));
    }, [lastDataUpdate, updateTableData, rowSorter]);

    /* FILTERING **************************************************************/

    // State for query value for input field
    const [query, setQuery] = useState('');
    // State for debounced query value used for filtering
    const [queryValue, setQueryValue] = useState('');
    // Debounced query value setter
    const debounceQuery = useMemo(
      () => debounce(value => setQueryValue(value), 300),
      [],
    );
    // Change handler for filter field
    const onQueryChange = useCallback(
      e => {
        setQuery(e?.target?.value || '');
        debounceQuery(e?.target?.value || '');
      },
      [debounceQuery],
    );
    // Function that filters the data based on the column configurations
    const dataFilter = useMemo(
      () => createDataFilter(filterable, columns),
      [filterable, columns],
    );
    const [filteredTableData, setFilteredTableData] = useState(tableData);

    useEffect(() => {
      // Filter the table data if filtering is enabled and a query value is set
      setFilteredTableData(
        tableData && dataFilter && queryValue
          ? dataFilter(queryValue, tableData)
          : tableData,
      );
    }, [queryValue, tableData, dataFilter]);

    /* PAGINATION *************************************************************/

    // Current page size
    const [pgSize, setPgSize] = useState(pageSize);
    // List of available page sizes
    const pgSizes = useMemo(() => {
      const sizes = Array.isArray(pageSizes) ? pageSizes : [10, 25, 50];
      if (!sizes.includes(pageSize)) {
        sizes.push(pageSize);
        sizes.sort((a, b) => a - b);
      }
      return sizes;
    }, [pageSize, pageSizes]);
    // Current offset
    const [offset, setOffset] = useState(0);
    // Data for current page
    const [currentTableData, setCurrentTableData] = useState(filteredTableData);

    // Count metadata
    const count = tableData?.length || 0;
    // Filtered count and page metadata
    const [[filteredCount, pageCount, pageNumber], setPageMetadata] = useState([
      [
        filteredTableData?.length || 0,
        pgSize > 0
          ? Math.max(Math.ceil((filteredTableData?.length || 0) / pgSize), 1)
          : 1,
        pgSize > 0 ? Math.floor(offset / pgSize) + 1 : 1,
      ],
    ]);

    // If the filter query or page size changes, reset the offset
    useEffect(() => {
      setOffset(0);
    }, [queryValue, pgSize]);

    // If the count changes, make sure the offset is still valid
    useEffect(() => {
      setOffset(o => (o >= filteredCount && o > 0 ? o - pgSize : o));
    }, [filteredCount, pgSize]);

    // Define function for getting the current page of data
    const paginateData = useCallback(() => {
      const filteredCount = filteredTableData?.length || 0;
      const currentData =
        filteredTableData && pgSize > 0
          ? filteredTableData.slice(offset, offset + pgSize)
          : filteredTableData;
      setCurrentTableData(currentData);
      // Update metadata whenever we update the current data
      setPageMetadata([
        filteredCount,
        pgSize > 0 ? Math.max(Math.ceil(filteredCount / pgSize), 1) : 1,
        pgSize > 0 ? Math.floor(offset / pgSize) + 1 : 1,
      ]);
    }, [offset, pgSize, filteredTableData]);

    // Defer the paginateData function because there are other effects that may
    // cause the function to be redefined multiple times, but we only want to
    // trigger it once
    const paginateDataDeferred = useDeferredValue(paginateData);

    // Trigger the deferred paginateData function to get the current data
    useEffect(() => {
      // Filter the table data if filtering is enabled and a query value is set
      paginateDataDeferred();
    }, [paginateDataDeferred]);

    const goToPage = useCallback(
      page => {
        setOffset((Math.min(Math.max(page, 1), pageCount) - 1) * pgSize);
      },
      [pageCount, pgSize],
    );

    /* COLUMN VISIBILITY ******************************************************/

    const [columnData, setColumnData] = useState(
      columns.map(({ visible = true, toggleable = true, ...column }) => ({
        visible,
        toggleable,
        ...column,
      })),
    );
    const currentColumns = useMemo(
      () => columnData.filter(col => col.visible),
      [columnData],
    );

    const toggleColumn = useCallback(
      property =>
        setColumnData(cols =>
          cols.map(col =>
            col.property === property && col.toggleable
              ? { ...col, visible: !col.visible }
              : col,
          ),
        ),
      [],
    );

    /* API ****************************************************************/

    const getData = useCallback(() => {
      return tableDataRef.current;
    }, []);

    const deleteRow = useCallback(
      index => {
        updateTableData(data => data.toSpliced(index, 1));
      },
      [updateTableData],
    );

    const addRow = useCallback(
      row => {
        updateTableData(data =>
          data.toSpliced(data.length, 0, ...processTableData([row], columns)),
        );
        // Set timestamp so we can re-sort the data
        setLastDataUpdate(new Date().getTime());
      },
      [updateTableData, columns],
    );

    const updateRow = useCallback(
      (row, index) => {
        updateTableData(data =>
          data.toSpliced(index, 1, ...processTableData([row], columns)),
        );
        // Set timestamp so we can re-sort the data
        setLastDataUpdate(new Date().getTime());
      },
      [updateTableData, columns],
    );

    /* RENDERING **************************************************************/

    // Container for built-in subforms
    const formContainerRef = useRef();

    // API functions for the widget and callbacks
    const tableApi = useMemo(
      () => ({
        addRow,
        updateRow,
        deleteRow,
        getData,
        reloadData: integration ? reloadData : undefined,
        actions: {
          subform: (options = {}) =>
            Subform({ container: formContainerRef.current, ...options }),
          add: (options = {}) =>
            Subform({
              container: formContainerRef.current,
              config: {
                modalTitle: 'Add Row',
                ...options,
                fields: columnData.map(
                  ({ label, property, fieldConfig = {} }) => ({
                    label,
                    property,
                    ...fieldConfig,
                  }),
                ),
                onSave: (data, api) => {
                  addRow(data);
                  toastSuccess({
                    title:
                      options.successMessage || 'Row was added successfully',
                  });
                  api.destroy();
                },
              },
            }),
          update: (row, index, options = {}) =>
            row && typeof index === 'number'
              ? Subform({
                  container: formContainerRef.current,
                  config: {
                    modalTitle: 'Add Row',
                    ...options,
                    fields: columnData.map(
                      ({ label, property, fieldConfig = {} }) => ({
                        label,
                        property,
                        ...fieldConfig,
                      }),
                    ),
                    values: row,
                    onSave: (data, api) => {
                      updateRow(data, index);
                      toastSuccess({
                        title:
                          options.successMessage ||
                          'Row was updated successfully',
                      });
                      api.destroy();
                    },
                  },
                })
              : console.error(
                  'Table Widget Error: The `actions.update` function requires passing `row` and `index` as the first 2 parameters.',
                ),
          delete: (index, options = {}) =>
            typeof index === 'number'
              ? openConfirm({
                  title: 'Delete Row',
                  description: `Are you sure you want to delete this row?`,
                  acceptLabel: 'Yes',
                  ...options,
                  accept: function () {
                    toastSuccess({
                      title:
                        options.successMessage ||
                        'Row was deleted successfully',
                    });
                    tableApi.deleteRow(index);
                  },
                })
              : console.error(
                  'Table Widget Error: The `actions.delete` function requires passing `index` as the first parameter.',
                ),
        },
      }),
      [
        addRow,
        updateRow,
        deleteRow,
        getData,
        integration,
        reloadData,
        columnData,
        formContainerRef,
      ],
    );

    // Define API ref
    const api = useRef({ ...tableApi });
    // Update API ref when its contents change
    useEffect(() => {
      Object.assign(api.current, tableApi);
    }, [tableApi]);

    return (
      <WidgetAPI ref={ref} api={api.current}>
        <TableRenderer
          currentTableData={currentTableData}
          currentColumns={currentColumns}
          // State
          loading={loading}
          error={error}
          title={title}
          messages={messages}
          allowExport={allowExport}
          // Actions
          rowActions={rowActions}
          addAction={addAction}
          selectAction={selectAction}
          // Column controls
          columnData={columnData}
          toggleable={toggleable}
          toggleColumn={toggleColumn}
          // Filtering
          filterable={!!dataFilter}
          query={query}
          queryValue={queryValue}
          onQueryChange={onQueryChange}
          // Sorting
          sortable={sortable}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          setSortData={setSortData}
          // Pagination
          pageSize={pgSize}
          setPageSize={setPgSize}
          pageSizes={pgSizes}
          count={count}
          filteredCount={filteredCount}
          pageCount={pageCount}
          pageNumber={pageNumber}
          goToPage={goToPage}
          // APIs
          formContainerRef={formContainerRef}
          tableApi={tableApi}
        />
      </WidgetAPI>
    );
  },
);

TableComponent.propTypes = {
  data: t.arrayOf(t.object),
  integration: t.shape({
    kappSlug: t.string,
    formSlug: t.string,
    integrationName: t.string,
    parameters: t.object,
    listProperty: t.string,
    errorProperty: t.string,
  }),
  rowTransform: t.func,
  onDataError: t.func,
  onDataSuccess: t.func,
  sortable: t.bool,
  filterable: t.bool,
  toggleable: t.bool,
  columns: t.arrayOf(
    t.shape({
      label: t.string,
      property: t.string.isRequired,
      displayTransform: t.func,
      sortable: t.bool,
      sortTransform: t.func,
      filterable: t.bool,
      filterTransform: t.func,
      filterOperator: t.oneOf(['matches', 'equals', 'startsWith']),
      filterFn: t.func,
      visible: t.bool,
      toggleable: t.bool,
      onClick: t.func,
      footerTransform: t.func,
      headerCellClass: t.string,
      bodyCellClass: t.string,
      footerCellClass: t.string,
      headerCellStyles: t.object,
      bodyCellStyles: t.object,
      footerCellStyles: t.object,
      fieldConfig: t.shape({
        type: t.string,
        required: t.bool,
        disabled: t.bool,
        validate: t.func,
      }),
    }),
  ).isRequired,
  addAction: t.shape({
    label: t.string,
    icon: t.string,
    onClick: t.func,
  }),
  rowActions: t.arrayOf(
    t.shape({ label: t.string, icon: t.string, onClick: t.func }),
  ),
  selectAction: t.shape({
    label: t.string,
    onClick: t.func,
  }),
  pageSize: t.number,
  pageSizes: t.arrayOf(t.number),
  defaultSort: t.oneOfType([t.number, t.array]),
  title: t.string,
  allowExport: t.bool,
  messages: t.shape({
    empty: t.string,
    loading: t.string,
    noMatches: t.string,
  }),
};

/**
 * Additional validations to be performed on the configurations of this widget.
 */
const validateConfig = (config, field) => {
  let valid = true;

  // Make sure either static or integration data is provided
  if (!config.data && !config.integration && !field) {
    console.error(
      'Table Widget Error: You must provide either a list of static `data` or an `integration` object that defines what integration to use for retrieving the data, or provide a Kinetic `field` whose data to use.',
    );
    valid = false;
  }

  // Validate static data
  if (config.data) {
    if (
      !Array.isArray(config.data) ||
      config.data.some(o => typeof o !== 'object')
    ) {
      console.error(
        'Table Widget Error: The `data` property must be an array of objects.',
      );
      valid = false;
    }
  }

  // Validate integration options
  if (config.integration) {
    if (config.data) {
      console.error(
        'Table Widget Error: The `integration` configuration will be ignored because `data` was also provided.',
      );
      valid = false;
    } else if (
      !config.integration.kappSlug ||
      !config.integration.integrationName ||
      !config.integration.listProperty
    ) {
      console.error(
        'Table Widget Error: The `integration.kappSlug`, `integration.integrationName`, and `integration.listProperty` properties are all required when using an integration.',
      );
      valid = false;
    } else if (
      config.integration.parameters &&
      typeof config.integration.parameters !== 'object'
    ) {
      console.error(
        'Table Widget Error: The `integration.parameters` property must be an object of key value pairs that defines the parameters that should be passed to the integration.',
      );
      valid = false;
    }
  }

  if (
    !config.columns ||
    !Array.isArray(config.columns) ||
    config.columns.some(f => typeof f !== 'object') ||
    config.columns.length === 0
  ) {
    console.error(
      'Table Widget Error: The `columns` property must be an array of objects and cannot be empty.',
    );
    valid = false;
  } else if (config.columns.some(f => !f.property)) {
    console.error(
      'Table Widget Error: Each column in the `columns` property must define a `property`.',
    );
    valid = false;
  }

  return valid;
};

/**
 * Function that initializes a Table widget. This function validates the
 * provided parameters, and then registers the widget, which will create an
 * instance of the widget and render it into the provided container.
 *
 * @param {HTMLElement} container HTML Element into which to render the widget.
 * @param {object} field Kinetic field object to store the data in.
 * @param {object} config Configuration object for the widget.
 * @param {string} [id] Optional id that can be used to retrieve a reference to
 *  the widget's API functions using the `Table.get` function.
 */
export const Table = ({ container, field, config, id } = {}) => {
  if (
    validateContainer(container, 'Table') &&
    (!field || validateField(field, 'text', 'Table')) &&
    validateConfig(config, field)
  ) {
    return registerWidget(Table, {
      container,
      Component: TableComponent,
      props: { ...config, field },
      id,
    });
  }
  return Promise.reject(
    'The Table widget parameters are invalid. See the console for more details.',
  );
};
