/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { toQueryParams } from '@/configs/Auth/utils/functions';
import axios, { GenericAbortSignal, InternalAxiosRequestConfig } from 'axios';

type IListener = (value?: unknown) => void;
type CustomConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  url?: string;
};

type RequestObserverOptions = {
  combineAbortSignals?: boolean;
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const REFRESH_URL = `${APP_URL}/api/auth/refresh_token`;

class RequestObserver {
  private readonly suspendedQueue: Set<IListener>;
  private readonly baseOptions?: RequestObserverOptions;
  private abortController: AbortController;
  private isSuspended: boolean;

  constructor(options?: RequestObserverOptions) {
    this.suspendedQueue = new Set<IListener>();
    this.baseOptions = options;
    this.abortController = new AbortController();
    this.isSuspended = false;
  }

  // Combine signal from component signal and observer signal into one
  private combineSignals = (aixosSignal?: GenericAbortSignal): AbortSignal => {
    const observerSignal = this.abortController.signal;
    if (!aixosSignal || !this?.baseOptions?.combineAbortSignals) return observerSignal;

    const combinedController = new AbortController();

    const abortHandler = () => combinedController.abort();

    observerSignal.onabort = abortHandler;
    aixosSignal.onabort = abortHandler;

    return combinedController.signal;
  };

  private subscribe = () => new Promise((resolve) => this.suspendedQueue.add(resolve));

  private handleReLogin = () => {
    const currentPath = window.location.href.replace(window.location.origin, '');
    const params = toQueryParams({ current: currentPath });
    window.location.href = `${APP_URL}/api/auth/login${params}`;
  };

  // Notify all listeners that the token has been updated and clear the suspendedQueue
  private notify = (token: string) => {
    localStorage.setItem('token', token);
    this.abortController = new AbortController();

    this.suspendedQueue.forEach((l) => l());
    this.suspendedQueue.clear();

    this.isSuspended = false;
  };

  // Exchange the refresh token for a new access token, cancel all pending requests and then notify all listeners
  // the canceled one will be re-executed with the new token when the token is updated
  private exchangeToken = async () => {
    if (this.isSuspended) return this.subscribe();

    this.isSuspended = true;
    this.abortController.abort();

    try {
      const res = await axios.get(REFRESH_URL);
      const newToken = res?.data?.data?.access_token;

      if (newToken) return this.notify(newToken);
    } catch (error) {
      console.log('Refresh token error: ', error);
    }

    this.handleReLogin();
  };

  // If the request is marked as retry, it will refresh the token
  // If the observer is suspended, it will subscribe to the suspendQueue
  // If the request has an existed signal, it will combine with the observer signal
  // Finally return the signal to axios interceptor request,
  public getReqSignal = async ({ _retry, signal }: CustomConfig): Promise<AbortSignal> => {
    if (_retry || this.isSuspended) await this.exchangeToken();
    return this.combineSignals(signal);
  };

  public getSuspendedStatus = () => this.isSuspended;
}

export default RequestObserver;
export type { CustomConfig };
export { APP_URL, REFRESH_URL };
