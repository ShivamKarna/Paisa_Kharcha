import { useState, useCallback } from "react";
import { toast } from "sonner";

const useFetch = <T, Args extends unknown[] = []>(
  cb: (...args: Args) => Promise<T>,
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | string | null>(null);

  const fn = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);

      try {
        const response = await cb(...args);
        setData(response);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error : "An Error occured");
        toast.error(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    },
    [cb],
  );

  return { data, loading, error, fn };
};

export default useFetch;
