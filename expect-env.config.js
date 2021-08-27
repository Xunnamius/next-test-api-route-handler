'use strict';

module.exports = {
  errorMessage:
    '\nCopy the ".env.example" file to ".env" or define the appropriate repository secrets',
  rules: [
    {
      name: '^MONGODB_URI$',
      value: '^.+:\\/\\/.+\\/.+$',
      required: false,
      errorMessage:
        'expected MONGODB_URI to be a valid Mongo connect URI with database name'
    },
    {
      name: '^GH_TOKEN$',
      value: '^[a-f0-9]+$',
      required: false,
      errorMessage:
        'expected GH_TOKEN to be undefined or a valid GitHub Personal Access Token'
    }
  ]
};
