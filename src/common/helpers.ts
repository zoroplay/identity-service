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

export const paginateResponse = (data: any,page: number,limit: number, message = 'success') => {
  const [result, total]=data;
  const lastPage=Math.ceil(total/limit);
  const nextPage=page+1 >lastPage ? 0 :page+1;
  const prevPage=page-1 < 1 ? 0 :page-1;
  return {
    message,
    data: JSON.stringify([...result]),
    count: total,
    currentPage: page,
    nextPage: nextPage,
    prevPage: prevPage,
    lastPage: lastPage,
  }
}