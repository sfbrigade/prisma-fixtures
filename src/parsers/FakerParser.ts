import { allFakers } from '@faker-js/faker';
import { IFixture, IParser } from '../interface';

export class FakerParser implements IParser {
    /**
     * @type {number}
     */
    public priority = 70;

    isSupport(value: string): boolean {
        return /\{\{.+}}/gm.test(value);
    }

    parse(value: string, fixture?: IFixture): any {
        let faker = allFakers.en;
        if (fixture?.locale) {
            faker = allFakers[fixture.locale as keyof typeof allFakers] ?? allFakers.en;
        }
        const result = faker.helpers.fake(value);

        if ((+result).toString() === result) {
            return +result;
        } else if (result === 'true' || result === 'false') {
            return result === 'true';
        } else {
            return result;
        }
    }
}
