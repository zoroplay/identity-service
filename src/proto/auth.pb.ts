/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "auth";

/** user */
export interface UserData {
  id: number;
  username: string;
  email: string;
}

/** send otp */
export interface SendOtpRequest {
  username: string;
  type: string;
}

export interface SendOtpResponse {
  status: number;
  success: boolean;
  message: string;
  error: string;
}

/** Register */
export interface SportBookRegisterRequest {
  username: string;
  password: string;
  phone: string;
}

export interface SportBookRegisterResponse {
  status: number;
  error: string;
  data: UserData | undefined;
}

/** Login */
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  error: string;
  token: string;
  data: UserData | undefined;
}

/** Validate */
export interface ValidateRequest {
  token: string;
}

export interface ValidateResponse {
  status: number;
  error: string;
  userId: number;
}

export interface ClientRequest {
  name: string;
  country: string;
  currency: string;
  website: string;
  contactNumber: string;
  contactEmail: string;
  clientID: string;
}

export interface RemoveClientRequest {
  clientID: string;
}

export interface RemoveRoleRequest {
  roleID: string;
}

export interface RemovePermissionRequest {
  permissionID: string;
}

export interface RoleRequest {
  name: string;
  description: string;
  roleID: string;
}

export interface PermissionRequest {
  name: string;
  description: string;
  permissionID: string;
}

export interface CommonResponse {
  status: boolean;
  message: string;
  data: string[];
  errors?: string | undefined;
}

export interface EmptyRequest {
}

export const AUTH_PACKAGE_NAME = "auth";

export interface AuthServiceClient {
  sportRegister(request: SportBookRegisterRequest): Observable<SportBookRegisterResponse>;

  login(request: LoginRequest): Observable<LoginResponse>;

  validate(request: ValidateRequest): Observable<ValidateResponse>;

  sendOtp(request: SendOtpRequest): Observable<SendOtpResponse>;

  createClient(request: ClientRequest): Observable<CommonResponse>;

  createPermission(request: PermissionRequest): Observable<CommonResponse>;

  createRole(request: RoleRequest): Observable<CommonResponse>;

  findAllPermissions(request: EmptyRequest): Observable<CommonResponse>;

  findAllClients(request: EmptyRequest): Observable<CommonResponse>;

  findAllRoles(request: EmptyRequest): Observable<CommonResponse>;

  removeClient(request: RemoveClientRequest): Observable<CommonResponse>;

  removeRole(request: RemoveRoleRequest): Observable<CommonResponse>;

  removePermission(request: RemovePermissionRequest): Observable<CommonResponse>;
}

export interface AuthServiceController {
  sportRegister(
    request: SportBookRegisterRequest,
  ): Promise<SportBookRegisterResponse> | Observable<SportBookRegisterResponse> | SportBookRegisterResponse;

  login(request: LoginRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  validate(request: ValidateRequest): Promise<ValidateResponse> | Observable<ValidateResponse> | ValidateResponse;

  sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> | Observable<SendOtpResponse> | SendOtpResponse;

  createClient(request: ClientRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  createPermission(request: PermissionRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  createRole(request: RoleRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  findAllPermissions(request: EmptyRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  findAllClients(request: EmptyRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  findAllRoles(request: EmptyRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  removeClient(request: RemoveClientRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  removeRole(request: RemoveRoleRequest): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;

  removePermission(
    request: RemovePermissionRequest,
  ): Promise<CommonResponse> | Observable<CommonResponse> | CommonResponse;
}

export function AuthServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "sportRegister",
      "login",
      "validate",
      "sendOtp",
      "createClient",
      "createPermission",
      "createRole",
      "findAllPermissions",
      "findAllClients",
      "findAllRoles",
      "removeClient",
      "removeRole",
      "removePermission",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AUTH_SERVICE_NAME = "AuthService";
