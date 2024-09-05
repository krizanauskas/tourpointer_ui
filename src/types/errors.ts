export interface ErrorFields {
    [key: string]: string; // Key is the field name, value is the error message
}

export interface ErrorData {
    fields: ErrorFields;
}

export interface ErrorResponse {
    data: ErrorData;
}

export interface AxiosErrorResponse extends Error {
    response?: ErrorResponse;
}