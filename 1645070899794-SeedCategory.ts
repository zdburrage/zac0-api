import {MigrationInterface, QueryRunner, getRepository} from "typeorm";
import { PizzaSeed } from './src/seeds/pizza.seed'
import { Pizza } from "./src/models/model";

export class SeedCategory1645070899794 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissions = await getRepository(Pizza).save(
            PizzaSeed
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
