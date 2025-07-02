import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PromoCodeEntity } from '../../promo-code/entity/promocode.entity';

@Entity({ name: 'CMNCITY', synchronize: false })
export class CmnCityEntity {
  @PrimaryGeneratedColumn({ name: 'CMNCITY_ID' })
  cmnCityId: number;

  @Column({ name: 'NAME', type: 'varchar2', length: 50, nullable: false })
  name: string;

  @Column({ name: 'IMPORT_URL', type: 'varchar2', length: 300, nullable: true })
  importUrl?: string;

  @Column({
    name: 'REGION_CODE',
    type: 'varchar2',
    length: 20,
    nullable: true,
  })
  regionCode?: string;

  @OneToMany(() => PromoCodeEntity, (promoCode) => promoCode.cmnCity)
  promoCodes: PromoCodeEntity[];
}
