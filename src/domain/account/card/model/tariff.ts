export class Tariff {
  cardTypeId: number;
  name: string;
  code: string;
  bonus: number;
  createdDate: Date;
  countryCode: number;

  constructor(
    cardTypeId: number,
    name: string,
    code: string,
    bonus: number,
    createdDate: Date,
    countryCode: number,
  ) {
    this.cardTypeId = cardTypeId;
    this.name = name;
    this.code = code;
    this.bonus = bonus;
    this.createdDate = createdDate;
    this.countryCode = countryCode;
  }
}
