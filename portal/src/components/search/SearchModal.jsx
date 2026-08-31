import { Modal } from '../../atoms/Modal.jsx';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { debounce } from 'lodash-es';
import { fetchCategory, fetchForms } from '@kineticdata/react';
import { useSelector } from 'react-redux';
import { Loading } from '../states/Loading.jsx';
import { Error } from '../states/Error.jsx';
import { Icon } from '../../atoms/Icon.jsx';
import { usePaginatedData } from '../../helpers/hooks/usePaginatedData.js';
import {
  openSearch,
  closeSearch,
  setPopularForms,
} from '../../helpers/search.js';
import { getAttributeValue } from '../../helpers/records.js';
import { Link } from 'react-router-dom';
import { useData } from '../../helpers/hooks/useData.js';

export const SearchModal = () => {
  // Get state from redux for the search modal and general app info
  const { open, searchOnly, popularForms } = useSelector(state => state.search);
  const { kapp, kappSlug } = useSelector(state => state.app);

  /*** SEARCH FUNCTIONALITY ***************************************************/

  // State for query value and its debounced value
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Debounce the query by 300ms
  const debouncedSetQuery = useMemo(
    () =>
      debounce(value => {
        setQuery(value);
      }, 300),
    [],
  );

  const handleSearchInputChange = e => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetQuery(value);
  };

  // Parameters for the search query
  const searchParams = useMemo(
    () =>
      query
        ? {
            kappSlug,
            q: `type = "Service" AND name *=* "${query}" AND (status = "Active" OR status = "New")`,
            limit: 10,
          }
        : null,
    [query, kappSlug],
  );

  // Perform the search
  const searchData = usePaginatedData(fetchForms, searchParams);
  const { error: searchError, forms: searchResults } =
    searchData.response || {};

  /*** POPULAR FORMS FUNCTIONALITY ********************************************/

  // Parameters for the popular services query (if null, the query will not run)
  const popularParams = useMemo(
    () =>
      !popularForms
        ? {
            kappSlug,
            categorySlug: 'popular-services',
            include:
              'categorizations.form,categorizations.form.attributesMap,categorizations.form.categorizations.category',
          }
        : null,
    [popularForms, kappSlug],
  );
  // Retrieve the popular requests if they're not saved in state
  const popularData = useData(fetchCategory, popularParams);
  useEffect(() => {
    if (!popularForms && popularData) {
      setPopularForms(
        popularData?.response?.category?.categorizations?.map(c => c?.form),
      );
    }
  }, [popularData, popularForms]);

  /*** CATEGORIES FUNCTIONALITY ***********************************************/

  // Get the categories and filter out any hidden ones
  const categories = kapp?.categories?.filter(
    c => getAttributeValue(c, 'Hidden', 'false')?.toLowerCase() !== 'true',
  );

  // State for path of categories and subcategories that have been opened
  const [path, setPath] = useState([]);
  // State for category index used for scrolling
  const [categoryIndex, setCategoryIndex] = useState([0]);
  const currentCategoryIndex = categoryIndex[categoryIndex.length - 1];

  // Are there any categories
  const hasCategories = categories?.length > 0;
  // Current category object
  const currentCategory =
    path.length > 0
      ? categories?.find(c => c.slug === path[path.length - 1])
      : null;
  // List of subcategories for current category, or all root categories
  const currentCategories = currentCategory
    ? categories.filter(
        c => getAttributeValue(c, 'Parent') === currentCategory.slug,
      )
    : categories?.filter(c => !getAttributeValue(c, 'Parent'));

  // Handler for going into a category
  const handleEnterCategory = categorySlug => {
    // The setTimeout is needed as a workaround to an ArkUI bug. If you click a
    // button in a Dialog, and that button is removed from the DOM due to the
    // click handler, the Dialog closes unexpectedly.
    window.setTimeout(() => {
      setPath(p => [...p, categorySlug]);
      setCategoryIndex(i => [...i, 0]);
    }, 0);
  };
  // Handler for going to the previous category page, or root page
  const handleExitCategory = () => {
    // The setTimeout is needed as a workaround to an ArkUI bug. If you click a
    // button in a Dialog, and that button is removed from the DOM due to the
    // click handler, the Dialog closes unexpectedly.
    window.setTimeout(() => {
      setPath(p => p.slice(0, -1));
      setCategoryIndex(i => i.slice(0, -1));
    }, 0);
  };

  const scrollCategoriesLeft = useCallback(() => {
    setCategoryIndex(i => i.toSpliced(-1, 1, Math.max(i[i.length - 1] - 4, 0)));
  }, []);
  const scrollCategoriesRight = useCallback(() => {
    const count = currentCategories?.length || 0;
    setCategoryIndex(i =>
      i.toSpliced(
        -1,
        1,
        Math.min(i[i.length - 1] + 4, Math.floor((count - 1) / 4) * 4),
      ),
    );
  }, [currentCategories]);

  /*** SERVICES FUNCTIONALITY *************************************************/

  // Parameters for the current category services query (if null, the query will not run)
  const servicesParams = useMemo(
    () =>
      currentCategory
        ? {
            kappSlug,
            categorySlug: currentCategory.slug,
            include:
              'categorizations.form,categorizations.form.attributesMap,categorizations.form',
          }
        : null,
    [currentCategory, kappSlug],
  );
  // Retrieve the services for the current category when a category is opened
  const servicesData = useData(fetchCategory, servicesParams);
  const servicesForms = servicesData?.response?.category?.categorizations?.map(
    c => c?.form,
  );

  // Parameters for the all services query (if null, the query will not run)
  const allServicesParams = useMemo(
    () =>
      !hasCategories
        ? {
            kappSlug,
            include: 'attributesMap',
            q: 'type = "Service" AND (status = "Active" OR status = "New")',
          }
        : null,
    [hasCategories, kappSlug],
  );
  // Retrieve all services if there are no categories
  const allServicesData = useData(fetchForms, allServicesParams);

  // Are any of the data fetches for services loading
  const servicesLoading = servicesData.loading || allServicesData.loading;

  /*** RENDER *****************************************************************/

  // Clear search when the modal is closed
  const onModalExit = () => {
    setInputValue('');
    setQuery('');
    setPath([]);
    setCategoryIndex([0]);
  };

  return (
    <Modal
      open={open}
      onOpenChange={({ open }) => (open ? openSearch() : closeSearch())}
      onExitComplete={onModalExit}
      size="sm"
    >
      {currentCategory && (
        <div slot="title" className="flex-sc gap-4">
          <button
            type="button"
            className="kbtn kbtn-ghost kbtn-circle"
            onClick={handleExitCategory}
            aria-label="Exit Category"
          >
            <Icon name="arrow-left" />
          </button>
          <span className="text-2xl font-semibold">{currentCategory.name}</span>
        </div>
      )}
      <div slot="body" className="flex-c-st gap-3">
        {!currentCategory && (
          <label className="kinput w-full">
            <input
              type="text"
              name="Search"
              placeholder="Search"
              value={inputValue}
              onChange={handleSearchInputChange}
              autoComplete="off"
              autoFocus={searchOnly}
            />
            <Icon name="search" size={20} />
          </label>
        )}
        {(searchOnly || searchData.initialized) && !currentCategory ? (
          <>
            <div className="text-2xl font-semibold mt-6">Search Results</div>
            <ul className="klist text-base p-3 border rounded-box">
              {!searchData.initialized ? (
                <li className="klist-row">
                  <em className="text-base-content/60">
                    Enter a search query to find services.
                  </em>
                </li>
              ) : searchError ? (
                <Error error={searchError} />
              ) : (
                <>
                  {searchData.loading && !searchResults && (
                    <Loading size={40} small />
                  )}
                  {searchResults?.length > 0
                    ? searchResults.map(form => (
                        <FormRow key={form.slug} form={form} />
                      ))
                    : null}
                  {searchResults?.length === 0 && (
                    <li className="klist-row">
                      <em className="text-base-content/60">
                        No results found.
                      </em>
                    </li>
                  )}
                  <Pagination
                    loading={searchData.loading}
                    previousPage={searchData.actions.previousPage}
                    nextPage={searchData.actions.nextPage}
                    pageNumber={searchData.pageNumber}
                  />
                </>
              )}
            </ul>
          </>
        ) : (
          <>
            {currentCategories?.length > 0 && (
              <>
                <div className="text-2xl font-semibold mt-6">Categories</div>
                <div className="relative">
                  {currentCategoryIndex !== 0 && (
                    <button
                      type="button"
                      className="absolute -left-6 top-2 kbtn kbtn-ghost kbtn-sm kbtn-circle"
                      aria-label="Scroll Categories Left"
                      onClick={scrollCategoriesLeft}
                    >
                      <Icon name="chevron-left" />
                    </button>
                  )}
                  <div className="flex-ss">
                    {currentCategories
                      .slice(currentCategoryIndex, currentCategoryIndex + 4)
                      .map(category => (
                        <div
                          className="group relative w-1/4 px-2 flex-c-sc gap-4"
                          key={category.slug}
                        >
                          <div className="icon-box-lg group-hover:bg-base-300">
                            <Icon
                              name={getAttributeValue(
                                category,
                                'Icon',
                                'category',
                              )}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEnterCategory(category.slug)}
                            className="cursor-pointer after:absolute after:inset-y-0 after:inset-x-2"
                          >
                            {category.name}
                          </button>
                        </div>
                      ))}
                  </div>
                  {currentCategoryIndex + 4 < currentCategories.length && (
                    <button
                      type="button"
                      className="absolute -right-6 top-2 kbtn kbtn-ghost kbtn-sm kbtn-circle"
                      aria-label="Scroll Categories Right"
                      onClick={scrollCategoriesRight}
                    >
                      <Icon name="chevron-right" />
                    </button>
                  )}
                </div>
              </>
            )}

            {!currentCategory && popularForms?.length > 0 && (
              <>
                <div className="text-2xl font-semibold mt-6">Popular</div>
                <ul className="klist text-base p-3 border rounded-box">
                  {popularForms.map(form => (
                    <FormRow key={form.slug} form={form} />
                  ))}
                </ul>
              </>
            )}

            {(currentCategory || !hasCategories) && (
              <>
                <div className="text-2xl font-semibold mt-6">Services</div>
                <ul className="klist text-base p-3 border rounded-box">
                  {servicesLoading && <Loading />}
                  {servicesForms?.length > 0
                    ? servicesForms.map(form => (
                        <FormRow key={form.slug} form={form} />
                      ))
                    : null}
                  {servicesForms?.length === 0 && (
                    <li className="klist-row">
                      <em className="text-base-content/60">
                        No services found.
                      </em>
                    </li>
                  )}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

const FormRow = ({ form }) => (
  <li className="klist-row hover:bg-base-200">
    <div className="flex-cc -my-3 h-9 w-9 bg-base-200 rounded-box">
      <Icon name={getAttributeValue(form, 'Icon', 'forms')} />
    </div>
    <div>
      <Link
        to={`/forms/${form.slug}`}
        className="after:absolute after:inset-0"
        onClick={closeSearch}
      >
        {form.name}
      </Link>
      <br />
      <small className="line-clamp-2">{form.description}</small>
    </div>
  </li>
);

const Pagination = ({ loading, previousPage, nextPage, pageNumber }) =>
  (previousPage || nextPage) && (
    <div className="flex-cc gap-3 mt-3">
      <button
        type="button"
        className="kbtn kbtn-outline"
        onClick={previousPage}
        disabled={!previousPage || loading}
      >
        <Icon name="chevron-left" />
        <span>Previous</span>
      </button>
      {loading ? (
        <Loading xsmall size={32} />
      ) : (
        <div className="flex-cc flex-none w-10 h-10 font-semibold">
          {pageNumber}
        </div>
      )}
      <button
        type="button"
        className="kbtn kbtn-outline"
        onClick={nextPage}
        disabled={!nextPage || loading}
      >
        <span>Next</span>
        <Icon name="chevron-right" />
      </button>
    </div>
  );
