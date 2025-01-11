import { ITransactionService } from './interface/transaction.interface';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AddRequestDto } from './dto/add-request.dto';
import { WithdrawRequestDto } from './dto/withdraw-request.dto';
import * as oracledb from 'oracledb';

@Injectable()
export class TransactionService implements ITransactionService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async add(data: AddRequestDto): Promise<any> {
    const addTransactionQuery = `begin :p0 := cwash.PAY_OPER_PKG.add_oper_open(:p1, :p2, :p3, :p4, :p5, :p6); end;`;
    const runAddPyamentQuery = await this.dataSource.query(
      addTransactionQuery,
      [
        { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        data.cardNumber,
        data.email,
        data.phone,
        data.sum,
        data.externalId,
        data.creationDate,
      ],
    );
    return runAddPyamentQuery[0];
  }

  async withdraw(data: WithdrawRequestDto): Promise<any> {
    const withdrawPointsQuery = `begin :p0 := cwash.CARD_PKG.add_oper_json(:p1, :p2, :p3, :p4); end;`;

    const runWithdrawPointsQuery = await this.dataSource.query(
      withdrawPointsQuery,
      [
        { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        data.deviceId,
        data.cardUnq,
        data.sum,
        data.pToken,
      ],
    );
    return JSON.parse(runWithdrawPointsQuery[0]);
  }
}
