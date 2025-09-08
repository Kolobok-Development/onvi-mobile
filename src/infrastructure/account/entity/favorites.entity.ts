import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'ONVI_FAVORITES_CARWASH_TO_USER', synchronize: false })
export class FavoritesEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column({ name: 'CMNCARWASH_ID', nullable: false })
  carWashId: number;

  @Column({ name: 'CRDCLIENT_ID', nullable: false })
  clientId: number;

  @Column({ name: 'DATE_ADDED', nullable: false })
  addedDate: Date;
}
