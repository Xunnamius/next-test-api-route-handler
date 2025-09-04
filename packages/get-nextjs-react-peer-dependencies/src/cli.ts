import { toAbsolutePath } from '@-xun/fs';
import { runProgram } from '@black-flag/core';

export default runProgram(toAbsolutePath(__dirname, 'commands'));
