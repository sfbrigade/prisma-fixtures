import { IProcessor } from '../../../../src/interface';

export default class UserProcessor implements IProcessor<any> {
    postProcess(name: string, object: { [key: string]: any }): void {
        object.name = `${object.firstName} ${object.lastName}`;
    }
}
