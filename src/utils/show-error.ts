import { useEffect } from "react";
import useErrorStore from "../stores/error-store";

export const showError = (msg: string, err?: unknown) => {
  console.log(msg, err);
  if (msg === "") return;

  useErrorStore.getState().setError(msg, err);
  useErrorStore.getState().setErrorShown(true);
};

export const useShowQueryError = (
  query: { isError: boolean; error: Error | null },
  getMessage: (msg: string) => string,
) => {
  useEffect(() => {
    if (query.isError) {
      showError(getMessage(query.error?.message ?? ""), query.error);
    }
  }, [query.error]);
};
