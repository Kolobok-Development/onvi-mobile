export class RefreshResponseDto {
  accessToken: string;
  accessTokenExp: string;

  constructor(partial: Partial<RefreshResponseDto>) {
    Object.assign(this, partial);
  }
}
