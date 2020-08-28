import { AxiosError } from "axios";
import { ID, PID } from "./annotationsModel";

export function mkTimestamp(): string {
  return (new Date()).toISOString();
}

export function axiosErrToMsg(error: AxiosError): string {
  if (error.response) {
    // Request made and server responded
    console.error(error.response);
    return `${error.response.data.error} (${error.response.status}): ${error.response.data.message}`;
  } else if (error.request) {
    // The request was made but no response was received
    console.error("Server not responding to request:");
    console.error(error.request);
    return "Server not responding";
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(error.message);
    return error.message;
  }
}

export function extractId(pid: PID): ID {
  return pid.substr(pid.lastIndexOf("/") + 1);
}

export function normaliseUrl(url: string|null): string|null {
  return (
    url ?
      url[url.length - 1] === "#" ? url.substring(0, url.length - 1) : url
    : null
  );
}
