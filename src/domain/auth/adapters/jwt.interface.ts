export interface IJwtServicePayload {
  phone: string;
}

export abstract class IJwtService {
  abstract validateToken(token: string): Promise<any>;
  abstract signToken(
    payload: IJwtServicePayload,
    secret: string,
    expiresIn: string,
  ): string;
}
