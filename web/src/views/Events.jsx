import { h, Fragment } from 'preact';
import ActivityIndicator from '../components/ActivityIndicator';
import Heading from '../components/Heading';
import Link from '../components/Link';
import Select from '../components/Select';
import produce from 'immer';
import { route } from 'preact-router';
import Event from './Event';
import { useIntersectionObserver } from '../hooks';
import { FetchStatus, useApiHost, useConfig, useEvents } from '../api';
import { Table, Thead, Tbody, Tfoot, Th, Tr, Td } from '../components/Table';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'preact/hooks';

const API_LIMIT = 25;

const initialState = Object.freeze({ events: [], reachedEnd: false, searchStrings: {}, deleted: 0 });
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'DELETE_EVENT': {
      const { deletedId } = action;

      return produce(state, (draftState) => {
        const idx = draftState.events.findIndex((e) => e.id === deletedId);
        if (idx === -1) return state;

        draftState.events.splice(idx, 1);
        draftState.deleted++;
      });
    }
    case 'APPEND_EVENTS': {
      const {
        meta: { searchString },
        payload,
      } = action;

      return produce(state, (draftState) => {
        draftState.searchStrings[searchString] = true;
        draftState.events.push(...payload);
        draftState.deleted = 0;
      });
    }

    case 'REACHED_END': {
      const {
        meta: { searchString },
      } = action;
      return produce(state, (draftState) => {
        draftState.reachedEnd = true;
        draftState.searchStrings[searchString] = true;
      });
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
};

const defaultSearchString = (limit) => `include_thumbnails=0&limit=${limit}`;
function removeDefaultSearchKeys(searchParams) {
  searchParams.delete('limit');
  searchParams.delete('include_thumbnails');
  searchParams.delete('before');
}

export default function Events({ path: pathname, limit = API_LIMIT } = {}) {
  const apiHost = useApiHost();
  const [{ events, reachedEnd, searchStrings, deleted }, dispatch] = useReducer(reducer, initialState);
  const { searchParams: initialSearchParams } = new URL(window.location);
  const [viewEvent, setViewEvent] = useState(null);
  const [searchString, setSearchString] = useState(`${defaultSearchString(limit)}&${initialSearchParams.toString()}`);
  const { data, status, deletedId } = useEvents(searchString);

  const scrollToRef = {};
  useEffect(() => {
    if (data && !(searchString in searchStrings)) {
      dispatch({ type: 'APPEND_EVENTS', payload: data, meta: { searchString } });
    }

    if (data && Array.isArray(data) && data.length + deleted < limit) {
      dispatch({ type: 'REACHED_END', meta: { searchString } });
    }

    if (deletedId) {
      dispatch({ type: 'DELETE_EVENT', deletedId });
    }
  }, [data, limit, searchString, searchStrings, deleted, deletedId]);

  const [entry, setIntersectNode] = useIntersectionObserver();

  useEffect(() => {
    if (entry && entry.isIntersecting) {
      const { startTime } = entry.target.dataset;
      const { searchParams } = new URL(window.location);
      searchParams.set('before', parseFloat(startTime) - 0.0001);

      setSearchString(`${defaultSearchString(limit)}&${searchParams.toString()}`);
    }
  }, [entry, limit]);

  const lastCellRef = useCallback(
    (node) => {
      if (node !== null && !reachedEnd) {
        setIntersectNode(node);
      }
    },
    [setIntersectNode, reachedEnd]
  );

  const handleFilter = useCallback(
    (searchParams) => {
      dispatch({ type: 'RESET' });
      removeDefaultSearchKeys(searchParams);
      setSearchString(`${defaultSearchString(limit)}&${searchParams.toString()}`);
      route(`${pathname}?${searchParams.toString()}`);
    },
    [limit, pathname, setSearchString]
  );

  const viewEventHandler = (id) => {
    //Toggle event view
    if (viewEvent === id) return setViewEvent(null);

    //Set event id to be rendered.
    setViewEvent(id);
  };

  const searchParams = useMemo(() => new URLSearchParams(searchString), [searchString]);

  return (
    <div className="w-full">
      <p className="text-center text-xs">Events</p>
      <div className="p-2 w-full">
        <div className="dropdown inline-block relative">
          <button className="font-semibold py-2 px-4 rounded inline-flex items-center">
            <span className="mr-1 text-xs">Select Camera</span>
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />{' '}
            </svg>
          </button>
          <ul className="dropdown-menu absolute hidden text-gray-700 pt-1 z-50 text-xs w-full">
            <li className="">
              <a className="rounded-t bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">
                Picamera
              </a>
            </li>
            <li className="">
              <a className="bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">
                Reolink
              </a>
            </li>
            <li className="">
              <a className="rounded-b bg-gray-200 hover:bg-gray-400 py-2 px-4 block whitespace-no-wrap" href="#">
                Test
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="min-w-0 ">
        {events.map(({ camera, id, label, start_time: startTime, end_time: endTime, top_score: score, zones }, i) => {
          const duration = Math.round(endTime - startTime).toFixed(0);
          const start = new Date(parseInt(startTime * 1000, 10));

          const end = new Date(parseInt(endTime * 1000, 10));
          const ref = i === events.length - 1 ? lastCellRef : undefined;
          return (
            <Fragment key={id}>
              <div className="grid items-center">
                <div className="p-1 flex items-center space-x-2 rounded-lg shadow-md hover:scale-105 transition transform duration-100 cursor-pointer">
                  <div>
                    <img
                      ref={(el) => (scrollToRef[id] = el)}
                      width="55"
                      height="55"
                      className="cursor-pointer"
                      style="min-height: 48px; min-width: 48px;"
                      src={`${apiHost}/api/events/${id}/thumbnail.jpg`}
                    />
                  </div>
                  <div>
                    <h1 className="text-xs font-bold mb-0">{label}</h1>
                    <p className="w-full text-xs">{camera}</p>
                    <p className="w-full text-xs">{`Date: ${start.toLocaleDateString()}`}</p>
                    <p className="w-full text-xs">{`Duration: ${duration} sec`}</p>
                  </div>
                </div>
              </div>

              {/*  <Tr data-testid={`event-${id}`} className={`${viewEvent === id ? 'border-none' : ''}`}>
                      <Td className="w-40">
                        <a
                          onClick={() => viewEventHandler(id)}
                          ref={ref}
                          data-start-time={startTime}
                          data-reached-end={reachedEnd}
                        >
                          <img
                            ref={(el) => (scrollToRef[id] = el)}
                            width="150"
                            height="150"
                            className="cursor-pointer"
                            style="min-height: 48px; min-width: 48px;"
                            src={`${apiHost}/api/events/${id}/thumbnail.jpg`}
                          />
                        </a>
                      </Td>
                      <Td>
                        <Filterable
                          onFilter={handleFilter}
                          pathname={pathname}
                          searchParams={searchParams}
                          paramName="camera"
                          name={camera}
                        />
                      </Td>
                      <Td>
                        <Filterable
                          onFilter={handleFilter}
                          pathname={pathname}
                          searchParams={searchParams}
                          paramName="label"
                          name={label}
                        />
                      </Td>
                      <Td>{(score * 100).toFixed(2)}%</Td>
                      <Td>
                        <ul>
                          {zones.map((zone) => (
                            <li>
                              <Filterable
                                onFilter={handleFilter}
                                pathname={pathname}
                                searchParams={searchString}
                                paramName="zone"
                                name={zone}
                              />
                            </li>
                          ))}
                        </ul>
                      </Td>
                      <Td>{start.toLocaleDateString()}</Td>
                      <Td>{start.toLocaleTimeString()}</Td>
                      <Td>{end.toLocaleTimeString()}</Td>
                    </Tr>
                    {viewEvent === id ? (
                      <Tr className="border-b-1">
                        <Td colSpan="8">
                          <Event eventId={id} close={() => setViewEvent(null)} scrollRef={scrollToRef} />
                        </Td>
                      </Tr>
                    ) : null} */}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function Filterable({ onFilter, pathname, searchParams, paramName, name }) {
  const href = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, name);
    removeDefaultSearchKeys(params);
    return `${pathname}?${params.toString()}`;
  }, [searchParams, paramName, pathname, name]);

  const handleClick = useCallback(
    (event) => {
      event.preventDefault();
      route(href, true);
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramName, name);
      onFilter(params);
    },
    [href, searchParams, onFilter, paramName, name]
  );

  return (
    <Link href={href} onclick={handleClick}>
      {name}
    </Link>
  );
}

function Filters({ onChange, searchParams }) {
  const { data } = useConfig();

  const cameras = useMemo(() => Object.keys(data.cameras), [data]);

  const zones = useMemo(
    () =>
      Object.values(data.cameras)
        .reduce((memo, camera) => {
          memo = memo.concat(Object.keys(camera.zones));
          return memo;
        }, [])
        .filter((value, i, self) => self.indexOf(value) === i),
    [data]
  );

  const labels = useMemo(() => {
    return Object.values(data.cameras)
      .reduce((memo, camera) => {
        memo = memo.concat(camera.objects?.track || []);
        return memo;
      }, data.objects?.track || [])
      .filter((value, i, self) => self.indexOf(value) === i);
  }, [data]);

  return (
    <div className="flex space-x-4">
      <Filter onChange={onChange} options={cameras} paramName="camera" searchParams={searchParams} />
      <Filter onChange={onChange} options={zones} paramName="zone" searchParams={searchParams} />
      <Filter onChange={onChange} options={labels} paramName="label" searchParams={searchParams} />
    </div>
  );
}

function Filter({ onChange, searchParams, paramName, options }) {
  const handleSelect = useCallback(
    (key) => {
      const newParams = new URLSearchParams(searchParams.toString());
      if (key !== 'all') {
        newParams.set(paramName, key);
      } else {
        newParams.delete(paramName);
      }

      onChange(newParams);
    },
    [searchParams, paramName, onChange]
  );

  const selectOptions = useMemo(() => ['all', ...options], [options]);

  return (
    <Select
      label={`${paramName.charAt(0).toUpperCase()}${paramName.substr(1)}`}
      onChange={handleSelect}
      options={selectOptions}
      selected={searchParams.get(paramName) || 'all'}
    />
  );
}