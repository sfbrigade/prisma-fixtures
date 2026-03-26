# Prisma Fixtures

Inspired by [@getbigger-io/prisma-fixtures-cli](https://github.com/getbigger-io/prisma-fixtures) (now abandoned), this is a modification of [typeorm-fixtures](https://github.com/RobinCK/typeorm-fixtures) for the Prisma ORM (latest Prisma 7 at time of writing). Note that not all features of typeorm-fixtures are supported.

Relying on [faker.js](https://github.com/faker-js/faker), prisma-fixtures allows you to create a ton of fixtures/fake data for use while developing or testing your project. It gives you a few essential tools to make it very easy to generate complex data with constraints in a readable and easy to edit way, so that everyone on your team can tweak the fixtures if needed.

## Table of Contents

- [Install](#install)
- [Development Setup](#development-setup)
- [Example](#example)
- [Creating Fixtures](#creating-fixtures)
  - [Fixture Ranges](#fixture-ranges)
  - [Fixture Reference](#fixture-reference)
  - [Fixture Lists](#fixture-lists)
- [Handling Relations](#handling-relations)
- [Advanced Guide](#advanced-guide)
  - [Parameters](#parameters)
  - [Faker Data](#faker-data)
  - [EJS templating](#ejs-templating)
  - [Load Processor](#load-processor)
  - [Entity Schemas](#entity-schemas)
- [Samples](#samples)
- [Usage](#usage)

## Install

#### NPM

```bash
npm install @sfcivictech/prisma-fixtures --save-dev
```

#### Yarn

```bash
yarn add @sfcivictech/prisma-fixtures --dev
```

## Development Setup

```bash
# install dependencies
yarn

# build dist files
yarn build
```

## Example

`fixtures/Comment.yml`

```yaml
entity: Comment
items:
  comment{1..10}:
    fullName: '{{name.firstName}} {{name.lastName}}'
    email: '{{internet.email}}'
    text: '{{lorem.paragraphs}}'
    post: '@post*'
```

`fixtures/Post.yml`

```yaml
entity: Post
items:
  post1:
    title: '{{name.title}}'
    description: '{{lorem.paragraphs}}'
    user: '@user($current)'
  post2:
    title: '{{name.title}}'
    description: '{{lorem.paragraphs}}'
    user: '@user($current)'
```

`fixtures/User.yml`

```yaml
entity: User
items:
  user1:
    firstName: '{{name.firstName}}'
    lastName: '{{name.lastName}}'
    email: '{{internet.email}}'
    profile: '@profile1'
    password: 'hashed_password'
  user2:
    firstName: '{{name.firstName}}'
    lastName: '{{name.lastName}}'
    email: '{{internet.email}}'
    profile: '@profile2'
    password: 'hashed_password'
```

`fixtures/Profile.yml`

```yaml
entity: Profile
items:
  profile1:
    aboutMe: <%= ['about string', 'about string 2', 'about string 3'].join(", ") %>
    skype: skype-account
    language: english
  profile2:
    aboutMe: <%= ['about string', 'about string 2', 'about string 3'].join(", ") %>
    skype: skype-account
    language: english
```

## Creating Fixtures

The most basic functionality of this library is to turn flat yaml files into objects

```yaml
entity: User
items:
  user0:
    username: bob
    fullname: Bob
    birthDate: 1980-10-10
    email: bob@example.org
    favoriteNumber: 42

  user1:
    username: alice
    fullname: Alice
    birthDate: 1978-07-12
    email: alice@example.org
    favoriteNumber: 27
```

### Fixture Ranges

The first step is to let create many copies of an object for you to remove duplication from the yaml file.

You can do that by defining a range in the fixture name:

```yaml
entity: User
items:
  user{1..10}:
    username: bob
    fullname: Bob
    birthDate: 1980-10-10
    email: bob@example.org
    favoriteNumber: 42
```

Now it will generate ten users, with IDs user1 to user10. Pretty good but we only have 10 bobs with the same name, username and email, which is not so fancy yet.

### Fixture Reference

You can also specify a reference to a previously created list of fixtures:

```yaml
entity: Post
items:
  post1:
    title: 'Post title'
    description: 'Post description'
    user: '@user1'
```

### Fixture Lists

You can also specify a list of values instead of a range:

```yaml
entity: Post
items:
  post{1..10}:
    title: 'Post title'
    description: 'Post description'
    user: '@user($current)'
```

In the case of a range (e.g. user{1..10}), `($current)` will return 1 for user1, 2 for user2 etc.

The current iteration can be used as a string value:

```yaml
entity: Post
items:
  post{1..10}:
    title: 'Post($current)'
    description: 'Post description'
```

`Post($current)` will return Post1 for post1, Post2 for post2 etc.

You can mutate this output by using basic math operators:

```yaml
entity: Post
items:
  post{1..10}:
    title: 'Post($current*100)'
    description: 'Post description'
```

`Post($current*100)` will return Post100 for post1, Post200 for post2 etc.

## Handling Relations

```yaml
entity: User
items:
  user1:
    # ...

entity: Group
items:
  group1:
    name: '<{names.admin}>'
    owner: '@user1'
    members:
      - '@user2'
      - '@user3'

```

If you want to create ten users and ten groups and have each user own one group, you can use `($current)` which is replaced with the current ID of each iteration when using fixture ranges:

```yaml
entity: User
items:
  user1:
    # ...

entity: Group
items:
  group{1..10}:
    name: 'name'
    owner: '@user($current)'
    members:
      - '@user2'
      - '@user3'

```

If you would like a random user instead of a fixed one, you can define a reference with a wildcard:

```yaml
entity: User
items:
  user1:
    # ...

entity: Group
items:
  group{1..10}:
    name: 'name'
    owner: '@user*'
    members:
      - '@user2'
      - '@user3'

```

or

```yaml
entity: User
items:
  user1:
    # ...

entity: Group
items:
  group{1..10}:
    name: 'name'
    owner: '@user{1..2}' # @user1 or @user2
    members:
      - '@user2'
      - '@user3'

```

## Advanced Guide

### Parameters

You can set global parameters that will be inserted everywhere those values are used to help with readability. For example:

```yaml
entity: Group
parameters:
  names:
    admin: Admin
items:
  group1:
    name: '<{names.admin}>' # <--- set Admin
    owner: '@user1'
    members:
      - '@user2'
      - '@user3'
```

### Faker Data

This library integrates with the [faker.js](https://github.com/faker-js/faker) library. Using {{foo}} you can call Faker data providers to generate random data.

Let's turn our static bob user into a randomized entry:

```yaml
entity: User
items:
  user{1..10}:
    username: '{{internet.userName}}'
    fullname: '{{name.firstName}} {{name.lastName}}'
    birthDate: '{{date.past}}'
    email: '{{internet.email}}'
    favoriteNumber: '{{datatype.number}}'
```

### EJS templating

This library integrates with the [EJS](https://github.com/mde/ejs)

```yaml
entity: Profile
items:
  profile1:
    aboutMe: <%= ['about string', 'about string 2', 'about string 3'].join(", ") %>
    skype: skype-account
    language: english
```

### Load Processor

Processors allow you to process objects before and/or after they are persisted. Processors must implement the: `IProcessor`

```typescript
import { IProcessor } from 'typeorm-fixtures-cli';
```

Here is an example:

`processor/UserProcessor.ts`

```typescript
import { IProcessor } from 'typeorm-fixtures-cli';
import { User } from '../entity/User';

export default class UserProcessor implements IProcessor<User> {
  preProcess(name: string, object: any): any {
    return { ...object, firstName: 'foo' };
  }

  postProcess(name: string, object: { [key: string]: any }): void {
    object.name = `${object.firstName} ${object.lastName}`;
  }
}
```

fixture config `fixtures/user.yml`

```yaml
entity: User
processor: ../processor/UserProcessor
items:
  user1:
    firstName: '{{name.firstName}}'
    lastName: '{{name.lastName}}'
    email: '{{internet.email}}'
```

#### Alternative Javascript Syntax for CommonJS

If you need to run the fixtures under CommonJS and are having problems using typescript with the load processors, this alternative example should work for you:

`processor/UserProcessor.js`

```javascript

class UserProcessor {
  preProcess(name, obj) {
    return { ...obj, firstName: 'foo' };
  }

  postProcess(name, obj) {
    obj.name = `${obj.firstName} ${obj.lastName}`;
  }
}

module.exports = { default: UserProcessor }

```

## Usage

```
Usage: fixtures load [options] <path> Fixtures folder/file path

Use -h or --help to show details of options: fixtures load -h
```

### Programmatically loading fixtures

Although typeorm-fixtures-cli is intended to use as a CLI, you can still load
fixtures via APIs in your program.

For example, the below code snippet will load all fixtures exist in `./fixtures` directory:

```typescript
import * as path from 'path';
import { Builder, fixturesIterator, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import { CommandUtils } from 'typeorm/commands/CommandUtils';

import { prisma } from './prisma/client'; // import an instance of your generated Prisma client

const loadFixtures = async (fixturesPath: string) => {
  try {
    const loader = new Loader();
    loader.load(path.resolve(fixturesPath));

    const resolver = new Resolver();
    const fixtures = resolver.resolve(loader.fixtureConfigs);
    const builder = new Builder(prisma, new Parser());

    for (const fixture of fixturesIterator(fixtures)) {
      await builder.build(fixture);
    }
  } catch (err) {
    throw err;
  }
};

loadFixtures('./fixtures')
  .then(() => {
    console.log('Fixtures are successfully loaded.');
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## Copyright

prisma-fixtures
Copyright (c) 2026 SF Civic Tech

typeorm-fixtures
Copyright (c) 2019 Igor Ognichenko
