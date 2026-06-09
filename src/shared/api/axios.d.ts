import "axios";

declare module "axios" {
  export interface AxiosRequestConfig<D = unknown> {
    _authRetry?: boolean;
    skipAuthHeader?: boolean;
    skipAuthRedirect?: boolean;
    skipAuthRefresh?: boolean;
  }

  export interface InternalAxiosRequestConfig<D = unknown> {
    _authRetry?: boolean;
    skipAuthHeader?: boolean;
    skipAuthRedirect?: boolean;
    skipAuthRefresh?: boolean;
  }
}
