'use strict';
/* eslint-disable no-console */

const debug = require('debug')(`${require('./package.json').name}:expect-env`);

const DEFAULT_VALUE_REGEX = [/^.*$/, /.*/];

class IllegalEnvironmentError extends Error {}

module.exports = {
  /**
   * This function accepts a single object parameter with a list of `rules` used
   * to verify `env`. If `env` is not defined, `process.env` is used instead. If
   * `rules` is not defined, the "rules" defined under the "expect-env" key in
   * ./package.json are used instead.
   *
   * Below, "name" is the name of an environment variable and "value" is its
   * expected value.
   *
   * Each rule can be one of:
   *
   * (1) A simple STRING variable "name" interpreted as RegExp(`^${STRING}$`)
   *
   * (2) An OBJECT where "name" and "value" are both regex STRINGs; "required"
   * is optional and defaults to `true`; and "errorMessage" is optional:
   *
   * {
   *   "name": "^(MY_)?VARIABLE_NAME$",
   *   "value": "^(true|false)$",
   *   "required": true, // ◄ optional
   *   "errorMessage": "some custom error message" // ◄ optional
   * }
   *
   * (3) An OBJECT where "operation" is either "xor", "or", "and", or "not";
   * "variables" is an array where each element is (1) or (2) (without
   * "required" or "errorMessage"); "required" is optional and defaults to
   * `true`; and "errorMessage" is optional:
   *
   * {
   *   "operation": "xor",
   *   "variables": ["^MY_V_1$", { name: "^MY_V_2$", value: "^.*$" }],
   *   "required": false, // ◄ optional
   *   "errorMessage": "some custom error message" // ◄ optional
   * }
   *
   * When "operation" is "xor", exactly one of the elements in "variables" must
   * match the environment. When it's "or", at least one of the elements must
   * match (this is the default). When it's "and", all of the elements must
   * match. When it's "not", exactly zero elements must match. When "required"
   * is `false` and "operation" is something other than "not", rules matching
   * non-existent variable names will be skipped (others will still be
   * verified).
   *
   * With both (2) and (3), "errorMessage" is output to the console if the rule
   * fails verification or was not found in `env` but "required" is `true`.
   *
   * When `isCli=false`, this function will return an array of objects each with
   * the shape of (3) representing all the rules that failed to match against
   * the current environment. An empty array is returned if all rules matched
   * and verification succeeded. When `isCli=true` (the default), this function
   * will output errors to the console and non-zero exit if verification fails.
   */
  verifyEnvironment(
    { rules, env: outsideEnv, isCli } = {
      rules: undefined,
      env: undefined,
      isCli: true
    }
  ) {
    let fromPkg = false;
    let errorMessage = null;

    const normalize = (rule) => {
      let normalizedRule;
      const makeErrorMessage = (reason) => `missing dep: ${reason}`;

      debug('::normalize (not normalized): %O', rule);

      if (typeof rule == 'string' || rule instanceof RegExp) {
        if (typeof rule == 'string') {
          rule = rule.startsWith('^') ? rule.slice(1) : rule;
          rule = rule.startsWith('$') ? rule.slice(0, -1) : rule;
          rule = RegExp(`^${rule}$`);
        }

        normalizedRule = {
          operation: 'or',
          variables: [{ name: rule, value: DEFAULT_VALUE_REGEX[0] }],
          required: true,
          errorMessage: String(
            makeErrorMessage(
              `must define environment variable with name matching regex ${rule}`
            )
          )
        };
      } else if (typeof rule.name == 'string' || rule.name instanceof RegExp) {
        rule.name = rule.name instanceof RegExp ? rule.name : RegExp(rule.name);
        rule.value =
          typeof rule.value == 'string'
            ? RegExp(rule.value)
            : rule.value instanceof RegExp
            ? rule.value
            : DEFAULT_VALUE_REGEX[0];

        normalizedRule = {
          operation: 'or',
          variables: [{ name: rule.name, value: rule.value }],
          required: typeof rule.required == 'undefined' || !!rule.required,
          errorMessage: String(
            rule.errorMessage ||
              makeErrorMessage(
                `must define environment variable with name matching regex ` +
                  `${rule.name}${
                    DEFAULT_VALUE_REGEX.map(String).includes(rule.value.toString())
                      ? ''
                      : ' and value matching regex ' + rule.value
                  }`
              )
          )
        };
      } else if (
        ['and', 'or', 'xor', 'not'].includes(rule.operation) &&
        Array.isArray(rule.variables)
      ) {
        const variables = rule.variables.map((r) => normalize(r).variables[0]);
        const not = rule.operation == 'not';
        const opString = not ? '    ' : `${rule.operation} `;

        const makeSubstr = (name, value) =>
          `name ${not ? 'NOT ' : ''}matching regex ${name}` +
          (DEFAULT_VALUE_REGEX.map(String).includes((value || '').toString())
            ? ''
            : ` and value ${not ? 'NOT ' : ''}matching regex ${value}`);

        normalizedRule = {
          operation: rule.operation,
          variables,
          required: typeof rule.required == 'undefined' || !!rule.required,
          errorMessage: String(
            rule.errorMessage ||
              makeErrorMessage(
                `must define ${
                  not ? 'ALL environment variables' : 'environment variable'
                } with` +
                  (variables.length > 1 ? ':\n' : ' ') +
                  variables
                    .slice(1)
                    .reduce(
                      (str, { name, value }) =>
                        `${str}\n${opString}${makeSubstr(name, value)}`,
                      `${' '.repeat(opString.length)}${makeSubstr(
                        variables[0].name,
                        variables[0].value
                      )}`
                    )
              )
          )
        };
      } else {
        debug('::normalize BAD RULE ENCOUNTERED: %O', rule);
        throw new IllegalEnvironmentError(
          `bad rule encountered${
            fromPkg ? ' in ./package.json "expect-env"' : ''
          }: ${JSON.stringify(rule, undefined, 2)}`
        );
      }

      debug('::normalize (normalized): %O', normalizedRule);
      return normalizedRule;
    };

    if (!rules) {
      try {
        ({
          'expect-env': { rules, errorMessage }
        } = require('./package.json'));
        fromPkg = true;
      } catch (ignored) {}
    }

    debug('rules: %O', rules);
    debug('errorMessage: %O', errorMessage);

    if (typeof rules == 'undefined') return [];

    if (!Array.isArray(rules)) {
      throw new IllegalEnvironmentError(
        fromPkg
          ? '"expect-env" key must have an array value in package.json'
          : '`rules` must be an array'
      );
    }

    const env = outsideEnv || process.env;
    const envVars = Object.keys(env);
    const violations = [];
    let verificationSucceeded = true;

    rules.map(normalize).forEach((rule) => {
      let succeeded = null;

      for (const { name, value } of rule.variables) {
        let matchedAtLeastOneVar = false;

        // ? Attempt to match variable names and values vs name and value
        const matched = envVars.some((v) => {
          const matchesName = name.test(v);
          matchedAtLeastOneVar = matchedAtLeastOneVar || matchesName;
          return matchesName && value.test(env[v]);
        });

        // ? If it's not required and not in env, skip evaluation
        if (!rule.required && !matchedAtLeastOneVar) {
          succeeded = true;
          continue;
        }

        if (rule.operation == 'or') {
          if (matched) {
            succeeded = true;
            break;
          }
        } else if (rule.operation == 'and') {
          if (matched) succeeded = true;
          else {
            succeeded = false;
            break;
          }
        } else if (rule.operation == 'not') {
          if (!matched) succeeded = true;
          else {
            succeeded = false;
            break;
          }
        } else if (rule.operation == 'xor') {
          if (succeeded === null) succeeded = !matched ? null : true;
          else if (succeeded && matched) {
            succeeded = false;
            break;
          }
        } else {
          throw new IllegalEnvironmentError(`unrecognized operation "${rule.operation}"`);
        }
      }

      if (!succeeded) isCli ? console.error(rule.errorMessage) : violations.push(rule);
      verificationSucceeded = verificationSucceeded && succeeded;
    });

    if (!verificationSucceeded && isCli)
      throw new IllegalEnvironmentError(
        !errorMessage ? 'environment verification failed' : errorMessage
      );

    debug('violated rules: %O', violations);
    return violations;
  }
};

try {
  !module.parent && module.exports.verifyEnvironment();
} catch (e) {
  console.error(e);
  process.exit(1);
}
