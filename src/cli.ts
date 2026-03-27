#!/usr/bin/env node

import 'reflect-metadata';
import * as yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { LoadCommand } from './commands/LoadCommand';

// eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-unused-expressions
yargs(hideBin(process.argv))
    .usage('Usage: $0 <command> [options]')
    .command(new LoadCommand())
    .recommendCommands()
    .demandCommand(1)
    .strict()
    .version(require('../package.json').version)
    .alias('v', 'version')
    .help('h')
    .alias('h', 'help')
    .parse();
