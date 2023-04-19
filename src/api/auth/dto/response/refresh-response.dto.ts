export class RefreshResponseDto {
  accessToken: string;

  constructor(partial: Partial<RefreshResponseDto>) {
    Object.assign(this, partial);
  }
}
