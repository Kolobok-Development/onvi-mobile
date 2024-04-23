import { Injectable } from '@nestjs/common';
import { IOrderRepository } from '../../../domain/order/order-repository.abstract';
import { Order } from '../../../domain/order/model/order';
import { HttpService } from '@nestjs/axios';
import { EnvConfigService } from '../../config/env-config/env-config.service';
import { HeadersReq } from '../dto/headers-req.dto';
import { firstValueFrom } from 'rxjs';
import { BayResponseDto } from '../dto/bay-response.dto';
import { CarwashResponseDto } from '../dto/carwash-response.dto';
import { SendStatus } from '../enum/send-status.enum';
import { OrderEntity } from '../entity/order.entity';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderStatus } from '../../../domain/order/enum/order-status.enum';
import * as oracledb from 'oracledb';
import { Card } from '../../../domain/account/card/model/card';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { Client } from '../../../domain/account/client/model/client';

@Injectable()
export class OrderRepository implements IOrderRepository {
  private apiKey: string;
  private baseUrl: string;
  private sourceCode: number;
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    private readonly httpService: HttpService,
    private readonly envConfig: EnvConfigService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    this.apiKey = envConfig.getDsCloudApiKey();
    this.baseUrl = envConfig.getDsCloudBaseUrl();
    this.sourceCode = envConfig.getDsCloudSourceId();
  }
  async create(order: Order): Promise<Order> {
    const orderEntity = this.toOrderEntity(order);

    const newOrder = await this.orderRepository.save(orderEntity);
    return Order.fromEntity(newOrder);
  }

  async createTransaction(
    client: Client,
    card: Card,
    promotion: Promotion,
    extId: string,
  ): Promise<any> {
    const addTransactionQuery = `begin :p0 := cwash.PAY_OPER_PKG.add_oper_open(:p1, :p2, :p3, :p4, :p5, :p6); end;`;
    const runAddPyamentQuery = await this.dataSource.query(
      addTransactionQuery,
      [
        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        card.nomer,
        client.email,
        client.correctPhone,
        promotion.point,
        extId,
        new Date(),
      ],
    );
    return runAddPyamentQuery[0];
  }

  async ping(carWashId: number, bayNumber: number): Promise<BayResponseDto> {
    const headersReq: any = this.setHeaders(this.apiKey);

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/external/collection/device?carwashId=${carWashId}&bayNumber=${bayNumber}`,
          { headers: headersReq },
        ),
      );

      return {
        id: response.data.identifier,
        status: response.data.status,
        type: response.data.type,
        errorMessage: null,
      };
    } catch (e) {
      const { response } = e;
      return {
        id: null,
        status: 'Unavailable',
        type: null,
        errorMessage: response.data.error,
      };
    }
  }

  async send(order: Order, bay: BayResponseDto): Promise<CarwashResponseDto> {
    const headersReq: any = this.setHeaders(this.apiKey);
    const body = {
      GVLCardNum: order.card.devNomer,
      GVLCardSum: order.sum.toString(),
      GVLSource: this.sourceCode,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/external/mobile/write/${bay.id}`,
          body,
          { headers: headersReq },
        ),
      );

      return {
        sendStatus: SendStatus.SUCCESS,
        errorMessage: null,
      };
    } catch (e) {
      const { response } = e;
      return {
        sendStatus: SendStatus.FAIL,
        errorMessage: response.data.error,
      };
    }
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: id },
    });

    if (!order) return null;

    order.orderStatus = status;

    await this.orderRepository.save(order);
  }

  async setExcecutionError(id: number, error: string): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id: id },
    });

    if (!order) return null;

    order.excecutionError = error;

    await this.orderRepository.save(order);
  }

  async update(order: Order): Promise<void> {
    return Promise.resolve(undefined);
  }

  private setHeaders(apiKey: string): HeadersReq {
    return {
      akey: apiKey,
    };
  }

  async withdraw(
    deviceId: number,
    cardUnq: string,
    sum: number,
    pToken?: string,
  ): Promise<any> {
    const withdrawPointsQuery = `begin :p0 := cwash.CARD_PKG.add_oper_json(:p1, :p2, :p3, :p4); end;`;

    const runWithdrawPointsQuery = await this.dataSource.query(
      withdrawPointsQuery,
      [
        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        deviceId,
        cardUnq,
        sum,
        pToken,
      ],
    );
    return JSON.parse(runWithdrawPointsQuery[0]);
  }

  private toOrderEntity(order: Order): OrderEntity {
    const orderEntity: OrderEntity = new OrderEntity();

    orderEntity.sum = order.sum;
    orderEntity.createdAt = order.createdAt;
    orderEntity.carWashId = order.carWashId;
    orderEntity.bayNumber = order.bayNumber;
    orderEntity.orderStatus = order.orderStatus;
    orderEntity.rewardPointsUsed = order.rewardPointsUsed;
    orderEntity.promoCodeId = order.promoCodeId;
    orderEntity.discountAmount = order.discountAmount;
    orderEntity.transactionId = order.transactionId;
    orderEntity.excecutionError = order.excecutionError;
    orderEntity.cardId = order.card.cardId;

    return orderEntity;
  }
}
