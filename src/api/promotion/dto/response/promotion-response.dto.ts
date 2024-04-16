export class PromotionResponseDto {
  status: string;
  code: string;

  constructor(partial: Partial<PromotionResponseDto>) {
    Object.assign(this, partial);
  }
}
