import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Api } from "./api";
import { API_PASS, API_URL, SHOW_LIMIT } from "./config";
import { useAsync } from "./hooks/useAsync";

const api = new Api(API_URL, API_PASS);

export const App = () => {
  const pageRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(0);

  const [ids, loadingIds, errorIds, reload] = useAsync(() => (
    api.action('get_ids', {
      offset: page * SHOW_LIMIT,
      limit: (SHOW_LIMIT + 1)
    })
  ), [page]);

  const [items, loadingItems, errorItems] = useAsync(() => (
    ids ? api.action('get_items', { ids }) : null
  ), [ids]);

  const renderItems = useMemo(() => {
    if (!items)
      return [];

    const used = new Set<string>();

    return items.slice(0, 50).filter(item => (
      used.has(item.id) ? false : used.add(item.id)
    ));
  }, [items]);

  const goPage = useCallback(() => {
    const input = Number(pageRef.current?.value);
    setPage(isNaN(input) ? 0 : input);
  }, []);

  const loading = loadingIds || loadingItems;
  const error = errorIds || errorItems;

  const hasPrev = useMemo(() => page > 0, [page]);
  const hasNext = useMemo(() => (items?.length ?? 0) > 50, [items]);

  useEffect(() => {
    if (error) {
      console.log(error);
      reload();
    }
  }, [error]);

  return (
    <div className="page">
      <div className="header">
        <button
          disabled={loading || !hasPrev}
          onClick={setPage.bind(null, v => v - 1)}
        >
          prev
        </button>

        <div className="title">
          <h3>Page:</h3>
          <div>
            <input disabled={loading} ref={pageRef} type="number" defaultValue={page} onKeyDown={e => e.key === 'Enter' && goPage()} key={page} />
            <button disabled={loading} onClick={goPage}>[ Go ]</button>
          </div>
          {
            !loading && <h3>Items: {renderItems.length}</h3>
          }
        </div>

        <button
          disabled={loading || !hasNext}
          onClick={setPage.bind(null, v => v + 1)}
        >
          next
        </button>
      </div>
      <div className="content">
        {
          createElement(() => {
            if (loading)
              return <h1>Loading...</h1>;

            if (error)
              return (
                <>
                  <h1>{`${error}`}</h1>
                  <button onClick={reload}>Reload</button>
                </>
              );

            return (
              <div className="items">
                {
                  renderItems.length ?
                    renderItems.map(
                      (item, i) => (
                        <div key={item.id} className="item">
                          <p>NUM: {i + 1}</p>
                          <p>ID: {item.id}</p>
                          <p>BRAND: {item.brand}</p>
                          <p>PRODUCT: {item.product}</p>
                          <p>PRICE: {item.price}</p>
                        </div>
                      )
                    ) : (
                      <h1>No items</h1>
                    )
                }
              </div>
            );
          })
        }
      </div>
    </div>
  );
};