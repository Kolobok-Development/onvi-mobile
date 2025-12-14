import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefundEntity } from '../entity/refund.entity';
import { IRefundPaymentRepository } from 'src/domain/payment/refund-payment-repository.abstract';

@Injectable()
export class RefundRepository implements IRefundPaymentRepository {
  constructor(
    @InjectRepository(RefundEntity)
    private readonly refundRepository: Repository<RefundEntity>,
  ) {}

  async createRefund(refundData: {
    orderId: number;
    sum: number;
    cardId: number;
    refundId: string;
    reason: string;
  }): Promise<number> {
    const refundEntity = this.refundRepository.create({
      orderId: refundData.orderId,
      sum: refundData.sum,
      cardId: refundData.cardId,
      refundId: refundData.refundId,
      reason: refundData.reason,
    });

    const savedRefund = await this.refundRepository.save(refundEntity);
    return savedRefund.id;
  }

  async findByOrderId(orderId: number): Promise<RefundEntity[]> {
    return await this.refundRepository
      .createQueryBuilder('refund')
      .where('refund.orderId = :orderId', { orderId })
      .orderBy('refund.createdAt', 'DESC')
      .getMany();
  }

  async findByRefundId(refundId: string): Promise<RefundEntity> {
    return await this.refundRepository
      .createQueryBuilder('refund')
      .where('refund.refundId = :refundId', { refundId })
      .getOne();
  }

  async findByCardId(cardId: number): Promise<RefundEntity[]> {
    return await this.refundRepository
      .createQueryBuilder('refund')
      .where('refund.cardId = :cardId', { cardId })
      .orderBy('refund.createdAt', 'DESC')
      .getMany();
  }

  async getRefundHistory(params: {
    cardId?: number;
    orderId?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<RefundEntity[]> {
    const query = this.refundRepository.createQueryBuilder('refund');

    if (params.cardId) {
      query.andWhere('refund.cardId = :cardId', { cardId: params.cardId });
    }

    if (params.orderId) {
      query.andWhere('refund.orderId = :orderId', { orderId: params.orderId });
    }

    if (params.startDate) {
      query.andWhere('refund.createdAt >= :startDate', {
        startDate: params.startDate,
      });
    }

    if (params.endDate) {
      query.andWhere('refund.createdAt <= :endDate', {
        endDate: params.endDate,
      });
    }

    query.orderBy('refund.createdAt', 'DESC');

    return await query.getMany();
  }
}
