export class Favorites {
  id?: number;
  carWashId?: number;
  clientId?: number;
  addedDate?: Date;

  constructor(
    id: number,
    carWashId: number,
    clientId: number,
    addedDate: Date,
  ) {
    this.id = id;
    this.carWashId = carWashId;
    this.clientId = clientId;
    this.addedDate = addedDate;
  }
}