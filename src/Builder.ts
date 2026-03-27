import * as fs from 'fs';
import * as path from 'path';
import { camelCase } from 'lodash';
import { IDataParser, IEntity, IFixture, IProcessor } from './interface';

export class Builder {
    public entities: any = {};
    private processorCache = new Map<string, IProcessor<any>>();

    constructor(
        private readonly client: any /* generated PrismaClient instance */,
        private readonly parser: IDataParser,
    ) {}

    async build(fixture: IFixture): Promise<IEntity> {
        let data = this.parser.parse(fixture.data, fixture, this.entities);
        let processorInstance: IProcessor<any> | undefined = undefined;

        if (fixture.processor) {
            processorInstance = this.getProcessorInstance(fixture.processor);
        }

        /* istanbul ignore else */
        if (processorInstance && typeof processorInstance.preProcess === 'function') {
            data = await processorInstance.preProcess(fixture.name, data);
        }

        const entity = { ...data } as IEntity;

        /* istanbul ignore else */
        if (processorInstance && typeof processorInstance.postProcess === 'function') {
            await processorInstance.postProcess(fixture.name, entity);
        }

        if (fixture.resolvedFields && Array.isArray(fixture.resolvedFields)) {
            await Promise.all(
                fixture.resolvedFields.map(async (propertyName) => {
                    const associatedEntity = await Promise.resolve(data[propertyName]);
                    let connect;
                    if (Array.isArray(associatedEntity)) {
                        connect = associatedEntity.map((e: any) => ({ id: e.id }));
                    } else if (associatedEntity) {
                        connect = { id: (associatedEntity as any).id };
                    }
                    if (connect) {
                        entity[propertyName] = { connect };
                    }
                }),
            );
        }

        this.entities[fixture.name] = await this.client[camelCase(fixture.entity)].create({ data: entity });

        return entity;
    }

    private getProcessorInstance(processor: string) {
        const processorPathWithoutExtension = path.join(
            path.dirname(processor),
            path.basename(processor, path.extname(processor)),
        );

        if (!this.processorCache.has(processorPathWithoutExtension)) {
            const processorInstance = this.createProcessorInstance(processorPathWithoutExtension);
            this.processorCache.set(processorPathWithoutExtension, processorInstance as IProcessor<any>);
        }

        return this.processorCache.get(processorPathWithoutExtension);
    }

    private createProcessorInstance(processorPathWithoutExtension: string) {
        if (
            !fs.existsSync(processorPathWithoutExtension) &&
            !fs.existsSync(processorPathWithoutExtension + '.ts') &&
            !fs.existsSync(processorPathWithoutExtension + '.js')
        ) {
            throw new Error(`Processor "${processorPathWithoutExtension}" not found`);
        }

        const processor = require(processorPathWithoutExtension).default;

        return new processor();
    }
}
