import {Provider} from "@nestjs/common";
import {IGazpromRepository} from "../../../../domain/partner/gazprom/gazprom-repository.abstract";
import {GazpromRepository} from "../repository/gazprom.repository";

export const GazpromRepositoryProvider: Provider = {
    provide: IGazpromRepository,
    useClass: GazpromRepository
}