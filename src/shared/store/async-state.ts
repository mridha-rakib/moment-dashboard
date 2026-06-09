export interface AsyncState {
  error: string | null;
  isLoading: boolean;
}

export const idleAsyncState: AsyncState = {
  error: null,
  isLoading: false,
};

export const loadingAsyncState = (): AsyncState => ({
  error: null,
  isLoading: true,
});

export const failedAsyncState = (error: string): AsyncState => ({
  error,
  isLoading: false,
});
