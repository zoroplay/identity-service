/* eslint-disable prettier/prettier */
export interface SuccessResponse {
  status: true;
  message: string;
  data: any;
}

export interface ErrorResponse {
  status: false;
  message: string;
  errors: any | null;
}

export type SuccessResponseFn = (data: any, message: string) => SuccessResponse;
export type ErrorResponseFn = (
  message: string,
  errors: any | null,
) => ErrorResponse;

export const handleResponse: SuccessResponseFn = (data, message) => {
  return {
    status: true,
    message,
    data,
  };
};

export const handleError: ErrorResponseFn = (message, errors) => {
  return {
    status: false,
    message,
    errors,
  };
};
