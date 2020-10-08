import type { AxiosRequestConfig, AxiosResponse } from "axios";
import axios from "axios";
import { axiosErrToMsg } from "./utils";

export type Token = string;

type Action<T> = () => Promise<T>;

export type AuthErrAction = Action<Token|null>;

export interface AuthInfo {
  token: Token;
  authErrAction?: AuthErrAction;
}

export function mkAuthHeader(token: string): Record<string, any> {
  return { headers: { Authorization: "Bearer " + token } };
}

function errWrapper<T>(pm: Promise<AxiosResponse<T>>): Promise<T> {
  return new Promise((resolve, reject) =>
    pm.then(
      resp => resolve(resp.data),
      err => reject(axiosErrToMsg(err))
    )
    .catch(err => reject(axiosErrToMsg(err)))
  );
}

function authWrapper<T>(pm: Promise<AxiosResponse<T>>, authErrAction?: AuthErrAction): Promise<AxiosResponse<T>|Token|null> {
  return new Promise((resolve, reject) =>
    pm.then(
      resp => resolve(resp),
      err => {
        if (authErrAction && err.response?.status === 401) {
          authErrAction().then(
            newAuth => resolve(newAuth),
            err => reject(err)
          );
        } else {
          reject(err);
        }
      }
    )
  );
}

export function http<T>(config: AxiosRequestConfig, authInfo?: AuthInfo): Promise<T> {

  function isAuth(resp: AxiosResponse<any>|Token|null): boolean {
    return typeof resp === "string";
  }

  return authInfo ?
    new Promise((resolve, reject) => {
      const conf1 = {
        ...config,
        ...mkAuthHeader(authInfo.token)
      };
      const pm1 = axios(conf1);
      authWrapper(pm1, authInfo.authErrAction).then(
        resp => {
          if (isAuth(resp)) {
            const token = resp as Token;
            const conf2 = {
              ...conf1,
              ...mkAuthHeader(token)
            };
            const pm2 = axios(conf2);
            resolve(errWrapper(pm2));
          } else {
            resolve(errWrapper(pm1));
          }
        },
        err => reject(axiosErrToMsg(err))
      );
    })
  :
    errWrapper(axios(config));
}

export function get<T>(url: string, query?: Record<string, any>, authInfo?: AuthInfo): Promise<T> {
  const config: AxiosRequestConfig = {
    method: "GET",
    url,
    ...(query ? { params: query } : {})
  };
  return http<T>(config, authInfo);
}

export function post<T>(url: string, data: T, authInfo?: AuthInfo): Promise<any> {
  const config: AxiosRequestConfig = {
    method: "POST",
    url,
    data
  };
  return http<T>(config, authInfo);
}

export function patch<T>(url: string, data: Partial<T>, authInfo?: AuthInfo): Promise<T> {
  const config: AxiosRequestConfig = {
    method: "PATCH",
    url,
    data
  };
  return http<T>(config, authInfo);
}

export function del(url: string, authInfo?: AuthInfo): Promise<any> {
  const config: AxiosRequestConfig = {
    method: "DELETE",
    url,
  };
  return http(config, authInfo);
}