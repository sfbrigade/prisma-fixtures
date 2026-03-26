import 'mocha';
import * as path from 'path';
import * as chaiAsPromised from 'chai-as-promised';
import * as chai from 'chai';
import { Builder, Parser } from '../../src';
import { Connection as MockConnection } from './assets/mock/Connection';

chai.use(chaiAsPromised);

describe('Builder', () => {
    it('should be build entity', async () => {
        const connection = new MockConnection();
        const parser = new Parser();
        const builder = new Builder(connection, parser, false);

        const result = await builder.build({
            parameters: {},
            entity: 'User',
            name: 'user1',
            processor: undefined,
            dependencies: [],
            resolvedFields: undefined,
            data: {
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
            },
        });

        chai.expect(result).to.be.deep.equal(
            Object.assign({}, {
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
            }),
        );
    });

    it('should be processed entity', async () => {
        const connection = new MockConnection();
        const parser = new Parser();
        const builder = new Builder(connection, parser, false);

        const result = await builder.build({
            parameters: {},
            entity: 'User',
            name: 'user1',
            processor: path.join(__dirname, 'assets/processor/UserProcessor.ts'),
            dependencies: [],
            resolvedFields: undefined,
            data: {
                firstName: 'firstName',
                lastName: 'lastName',
                email: 'email',
            },
        });

        chai.expect(result).to.be.deep.equal(
            Object.assign({}, {
                firstName: 'foo',
                lastName: 'bar',
                email: 'email',
            }),
        );
    });

    it('should be processor not found', () => {
        const connection = new MockConnection();
        const parser = new Parser();
        const builder = new Builder(connection, parser, false);

        chai.expect(
            builder.build({
                parameters: {},
                entity: 'User',
                name: 'user1',
                processor: 'assets/processor/UserProcessor.ts',
                dependencies: [],
                resolvedFields: undefined,
                data: {
                    firstName: 'firstName',
                    lastName: 'lastName',
                    email: 'email',
                },
            }),
        ).to.be.rejectedWith('Processor "assets/processor/UserProcessor.ts" not found');
    });

    it('should be resolved entity field as promised', async () => {
        const connection = new MockConnection();
        const parser = new Parser();
        const builder = new Builder(connection, parser, false);
        builder.entities = {
            user1: Object.assign({}, {
                firstName: 'foo',
                lastName: 'boo',
                email: 'email',
            }),
        };

        const post = await builder.build({
            parameters: {},
            entity: 'Post',
            name: 'post1',
            dependencies: ['user1'],
            processor: undefined,
            resolvedFields: ['user'],
            data: {
                title: 'A Post',
                description: 'A description',
                user: '@user1',
            },
        });

        const awaitedResult = {
            title: post.title,
            description: post.description,
            user: await post.user,
        };

        chai.expect(awaitedResult).to.be.deep.equal({
            title: 'A Post',
            description: 'A description',
            user: builder.entities['user1'],
        });
    });
});
