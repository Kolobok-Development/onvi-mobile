import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionEntity } from './entity/promotion.entity';
import { PromotionUsageEntity } from './entity/promotion-usage.entity';
import { PromotionRepositoryProvider } from './provider/promotion-repository.provider';
import { PromotionController } from '../../api/promotion/promotion.controller';
import { PromotionUsecase } from '../../application/usecases/promotion/promotion.usecase';
import { PromotionRepository } from './repository/promotion.repository';
import { OrderModule } from '../order/order.module';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PromotionEntity, PromotionUsageEntity]),
    OrderModule,
    AccountModule,
  ],
  controllers: [PromotionController],
  providers: [
    PromotionRepositoryProvider,
    PromotionUsecase,
    PromotionRepository,
  ],
  exports: [PromotionRepositoryProvider],
})
export class PromotionModule {}
