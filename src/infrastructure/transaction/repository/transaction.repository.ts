import { Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../../../domain/transaction/transaction-repository.abstract';
import { Client } from '../../../domain/account/client/model/client';
import { Card } from '../../../domain/account/card/model/card';
import { Promotion } from '../../../domain/promotion/model/promotion.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as oracledb from 'oracledb';

@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(
    client: Client,
    card: Card,
    promotionPoint: string,
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
        promotionPoint,
        extId,
        new Date(),
      ],
    );
    return runAddPyamentQuery[0];
  }

  async withdraw(
    deviceId: string,
    cardUnq: string,
    sum: string,
    pToken?: string,
  ): Promise<any> {
    const withdrawPointsQuery = `begin :p0 := cwash.CARD_PKG.add_oper_json(:p1, :p2, :p3, :p4); end;`;

    const runWithdrawPointsQuery = await this.dataSource.query(
      withdrawPointsQuery,
      [
        { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        deviceId,
        cardUnq,
        sum,
        pToken,
      ],
    );
    return JSON.parse(runWithdrawPointsQuery[0]);
  }

  async add(
    cardId: string,
    typeOperId: string,
    sum: string,
    comment?: string,
    userId?: string,
  ): Promise<any> {
    const addOperationQuery = `begin cwash.CARD_PKG.add_oper(:p1, :p2, :p3, :p4, :p5); end;`;
  
    await this.dataSource.query(addOperationQuery, [
      cardId,          // :p1
      typeOperId,      // :p2
      sum,             // :p3
      comment || null, // :p4
      userId || null,  // :p5
    ]);
  
    return { success: true };
  }
}
