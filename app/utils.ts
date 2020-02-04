import { AxiosError } from "axios";

export function axiosErrToMsg(error: AxiosError): string {
  if (error.response) {
    // Request made and server responded
    console.error(error.response);
    return error.response.data + " (" + error.response.status + ")";
  } else if (error.request) {
    // The request was made but no response was received
    console.error(error.request);
    return error.request;
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error(error.message);
    return error.message;
  }
}