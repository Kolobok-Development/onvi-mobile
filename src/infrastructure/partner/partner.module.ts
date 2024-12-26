import {Module} from "@nestjs/common";
import {GazpromRepositoryProvider} from "./gazprom/provider/gazprom-repository.provider";
import {GazpromRepository} from "./gazprom/repository/gazprom.repository";
import {GazpromUsecase} from "../../application/usecases/partner/gazprom/gazprom.usecase";
import {PartnerController} from "../../api/partner/partner.controller";
import {HttpModule} from "@nestjs/axios";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PartnerEntity} from "./entity/partner.entity";
import {PartnerClientEntity} from "./entity/partner-client.entity";
import {PartnerRepositoryProvider} from "./provider/partner-repository.provider";
import {PartnerUsecase} from "../../application/usecases/partner/partner.usecase";
import {PartnerStrategy} from "../common/strategies/partner.strategy";

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([PartnerEntity, PartnerClientEntity])],
    controllers: [PartnerController],
    providers: [GazpromRepositoryProvider, PartnerRepositoryProvider, GazpromUsecase, GazpromRepository, PartnerUsecase, PartnerStrategy],
    exports: [GazpromRepositoryProvider, PartnerRepositoryProvider, PartnerUsecase]
})
export class PartnerModule {}