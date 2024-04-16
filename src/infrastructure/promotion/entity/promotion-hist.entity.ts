import {Column, ViewColumn, ViewEntity} from 'typeorm';
import { Exclude } from 'class-transformer';

@ViewEntity({
  expression: `
        SELECT *
        FROM ONVI_MOBILE_PROMOTION_HIST
    `,
  name: 'ONVI_MOBILE_PROMOTION_HIST',
})
export class PromotionHistEntity {
  @ViewColumn({ name: 'CARD_ID' })
  cardId: number;

  @ViewColumn({ name: 'PROMOTION_ID' })
  promotionId: number;

  @ViewColumn({ name: 'TITLE' })
  title: string;

  @ViewColumn({ name: 'DESCRIPTION' })
  description: string;

  @ViewColumn({ name: 'CODE' })
  code: string;

  @ViewColumn({ name: 'TYPE' })
  type: number;

  @ViewColumn({ name: 'IMAGE' })
  image: string;

  @ViewColumn({ name: 'POINT' })
  point: number;

  @ViewColumn({ name: 'CASHBACK_TYPE' })
  cashbackType: number;

  @ViewColumn({ name: 'CASHBACK_SUM' })
  cashbackSum: number;

  @ViewColumn({ name: 'PROMOTION_USAGE_ID' })
  promotionUsageId: number;

  @ViewColumn({ name: 'EXPIRY_PERIOD_DATE' })
  expiryPeriodDate: Date;

  @ViewColumn({ name: 'USAGE_DATE' })
  usageDate: Date;
}
