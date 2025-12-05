import axios, { AxiosResponse, AxiosInstance, AxiosError } from 'axios';
import RequestObserver, { APP_URL, CustomConfig, REFRESH_URL } from './RequestObserver';
import { toQueryParams } from './Auth/utils/functions';

const NEW_COD_URL = process.env.NEXT_PUBLIC_OS_API_URL;
const errorMessage = 'Có lỗi trong quá trình thực thi';
const observer = new RequestObserver();

const errorCallback = (status?: number, error?: string) => ({
  status: status ?? 500,
  error: error ?? errorMessage,
});

const handleGetToken = async () => {
  const currentPath = window.location.href.replace(window.location.origin, '');
  const params = toQueryParams({ current: currentPath });
  window.location.href = `${APP_URL}/api/auth/login${params}`;
};

const handle403Status = async (dataError: { message: string }, config?: CustomConfig) => {
  if (config?.url === REFRESH_URL) {
    handleGetToken();
  }
  return errorCallback(403, dataError?.message);
};

class ApiClient {
  private readonly api: AxiosInstance;

  constructor(baseURL: string, tokenType: string = 'Authorization', appType?: string) {
    this.api = axios.create({
      baseURL: baseURL || NEW_COD_URL || '',
      timeout: 30000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => this.handleInterceptReq(config, tokenType, appType),
      (error) => Promise.reject(error),
    );
    this.api.interceptors.response.use(this.handleInterceptRes, this.handleInterceptResError);
  }

  handleInterceptReq = async (config: CustomConfig, tokenType: string, appType?: string) => {
    const signal = await observer.getReqSignal(config);

    const token = localStorage.getItem('token') ?? '';

    config.headers[tokenType] = tokenType !== 'Authorization' ? token : `Bearer ${token}`;
    config.headers['apptype'] = appType;
    config.headers['app-version'] = process.env.buildId;
    config.signal = signal;

    return config;
  };

  handleInterceptRes = (response: AxiosResponse) => {
    const data = response.data;

    if (data.success === false) {
      const message = typeof data?.message === 'string' ? data?.message : errorMessage;
      return { ...response.data, status: 400, error: message };
    }

    return response.data;
  };

  handleInterceptResError = async (error: AxiosError) => {
    const config = error.config as CustomConfig | undefined;
    const resError = error.response;
    const rawError = resError?.data as { message?: string } | undefined;
    const dataError = { message: rawError?.message ?? '' };
    const isCancelNotFromUser = axios.isCancel(error) && observer.getSuspendedStatus();

    if (config?._retry) return errorCallback(resError?.status, dataError?.message);

    if (resError?.status === 401 || isCancelNotFromUser) {
      if (!config) return errorCallback(401, dataError?.message);
      config._retry = true;

      return this.api(config);
    }

    if (resError?.status === 403) {
      return handle403Status(dataError, config);
    }

    return errorCallback(resError?.status, dataError?.message || '');
  };

  public getInstance = () => this.api;
}

export default ApiClient;
