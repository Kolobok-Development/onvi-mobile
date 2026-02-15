export class CheckUserResponseDto {
  isOnviUser: boolean;

  constructor(partial: Partial<CheckUserResponseDto>) {
    Object.assign(this, partial);
  }
}
