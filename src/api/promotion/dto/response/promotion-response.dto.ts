export class PromotionResponseDto {
  status: string;
  code: string;
  totalPoints: number;

  constructor(partial: Partial<PromotionResponseDto>) {
    Object.assign(this, partial);
  }
}
