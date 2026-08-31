import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Carousel } from '@ark-ui/react/carousel';
import { defineKqlQuery, searchSubmissions } from '@kineticdata/react';
import { sortBy } from '../../helpers/index.js';
import { Loading } from '../states/Loading.jsx';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../atoms/Button.jsx';
import { useData } from '../../helpers/hooks/useData.js';

const NewsLink = ({ title, description, link, image, index, mobile }) => {
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="w-full h-full flex outline-0"
      aria-label={`Article ${index + 1}`}
      tabIndex={-1}
    >
      <div
        className={clsx(
          // Common styles
          'flex-auto flex flex-col',
          // Mobile first styles
          'py-4 px-3',
          // Non mobile styles
          'md:gap-4 md:py-10 md:px-20',
        )}
      >
        <div
          className={clsx(
            // Common styles
            'text-neutral-content font-medium ',
            // Mobile first styles
            'text-sm line-clamp-3',
            // Non mobile styles
            'md:text-h3 md:line-clamp-1',
          )}
        >
          {title}
        </div>
        {!mobile && (
          <div className="flex-none text-neutral-content line-clamp-1">
            {description}
          </div>
        )}
      </div>
      {image && (
        <img
          src={image}
          alt={`Image for article ${index + 1}`}
          className="flex-none basis-1/2 md:basis-1/3 h-full object-cover"
        />
      )}
    </a>
  );
};

// Query for retrieving news data
const newsSearch = {
  q: defineKqlQuery().equals('values[Status]', 'status').end()({
    status: 'Active',
  }),
  include: ['values'],
  limit: 5,
};

// Transform function for converting news submissions into the format
// needed for the UI
const newsTransform = submissions =>
  submissions
    ?.map(({ values }) => ({
      title: values['Title'],
      description: values['Description'],
      link: values['URL'],
      image: values['Image URL'],
      sortOrder: parseInt(values['Sort Order'], 10) || 999,
    }))
    ?.filter(news => news.link)
    ?.sort(sortBy('sortOrder'));

export const NewsSection = () => {
  const mobile = useSelector(state => state.view.mobile);
  const { kappSlug } = useSelector(state => state.app);

  // Parameters for the news query
  const params = useMemo(
    () => ({ kapp: kappSlug, form: 'portal-news', search: newsSearch }),
    [kappSlug],
  );

  const { initialized, loading, response } = useData(searchSubmissions, params);
  const news = newsTransform(response?.submissions);

  const pageSize = news?.length || 1;
  const [openIndex, setOpenIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!paused) {
      const timeout = setTimeout(() => {
        setOpenIndex((openIndex + 1) % pageSize);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [openIndex, paused, pageSize]);

  return (
    initialized &&
    !response?.error && (
      <>
        {loading && <Loading />}
        {!loading && news?.length > 0 && (
          <Carousel.Root
            page={openIndex}
            onPageChange={({ page }) => setOpenIndex(page)}
            loop={true}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className={clsx(
              'relative block h-28 md:h-44 overflow-hidden transition',
            )}
          >
            <div
              className={clsx(
                'relative flex flex-col h-full w-full overflow-hidden rounded-2xl bg-neutral',
              )}
            >
              <Carousel.ItemGroup className="flex-auto max-h-full">
                {news.map((news, index) => (
                  <Carousel.Item
                    key={index}
                    index={index}
                    className="overflow-hidden"
                  >
                    <NewsLink index={index} mobile={mobile} {...news} />
                  </Carousel.Item>
                ))}
              </Carousel.ItemGroup>
            </div>
            <Carousel.IndicatorGroup
              className={clsx(
                'absolute bottom-0.75 left-1.5 md:bottom-5 md:left-[4.625rem]',
              )}
            >
              {news.map((news, index) => (
                <Carousel.Indicator key={index} index={index} asChild>
                  <Button
                    variant="custom"
                    icon="point-filled"
                    size="custom"
                    aria-label={`Show article ${index + 1}`}
                    className={clsx(
                      'p-0 border-transparent text-neutral-content opacity-20 data-[current]:opacity-100',
                      'hover:text-accent hover:opacity-100',
                      'focus-within:text-accent focus-within:opacity-100',
                    )}
                    tabIndex={-1}
                  >
                    <a
                      href={news.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={news.title}
                      className="pointer-events-none"
                      onFocus={() => {
                        setOpenIndex(index);
                        setPaused(true);
                      }}
                      onBlur={() => {
                        setPaused(false);
                      }}
                    />
                  </Button>
                </Carousel.Indicator>
              ))}
            </Carousel.IndicatorGroup>
          </Carousel.Root>
        )}
      </>
    )
  );
};
