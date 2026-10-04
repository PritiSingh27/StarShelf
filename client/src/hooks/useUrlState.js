import { useSearchParams } from 'react-router-dom';

export function useUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key, fallback) => {
    return searchParams.get(key) || fallback;
  };

  const setParams = (newParams) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(newParams).forEach(([k, v]) => {
          if (v === null || v === undefined || v === '') {
            next.delete(k);
          } else {
            next.set(k, String(v));
          }
        });
        return next;
      },
      { replace: true }
    );
  };

  return [getParam, setParams, searchParams];
}
