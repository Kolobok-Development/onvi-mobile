export interface IJwtServicePayload {
  phone: string;
}

export interface IJwtService {
  validateToken(token: string): Promise<any>;
  signToken(
    payload: IJwtServicePayload,
    secret: string,
    expiresIn: string,
  ): string;
}
