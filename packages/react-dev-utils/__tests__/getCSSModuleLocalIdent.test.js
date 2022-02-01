/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const getCSSModuleLocalIdent = require('../getCSSModuleLocalIdent');

const rootContext = '/path';
const defaultClassName = 'class';
const defaultOptions = {
  context: undefined,
  hashSalt: undefined,
  regExp: null,
};

const tests = [
  {
    resourcePath: '/path/to/file.module.css',
    expected: 'file_class__jqNYY',
  },
  {
    resourcePath: '/path/to/file.module.scss',
    expected: 'file_class__BjEjJ',
  },
  {
    resourcePath: '/path/to/file.module.sass',
    expected: 'file_class__dINZX',
  },
  {
    resourcePath: '/path/to/file.module.sass',
    expected: 'file_class__9vVbt',
    options: {
      hashSalt: 'my-app',
    },
  },
  {
    resourcePath: '/path/to/file.name.module.css',
    expected: 'file_name_class__XpUJW',
  },
  {
    resourcePath: '/path/to/file.name.module.css',
    expected: 'file_name_class__OS1Yg',
    options: {
      hashSalt: 'my-app',
    },
  },
  {
    resourcePath: '/path/to/file.name.module.css',
    expected: 'file_name_class__uMbcn',
    options: {
      hashSalt: 'my-app-123',
    },
  },
];

describe('getCSSModuleLocalIdent', () => {
  tests.forEach(test => {
    const {
      className = defaultClassName,
      expected,
      resourcePath,
      options = defaultOptions,
    } = test;
    it(JSON.stringify({ resourcePath, className }), () => {
      const ident = getCSSModuleLocalIdent(
        {
          resourcePath,
          rootContext,
        },
        '[hash:base64]',
        className,
        options
      );
      expect(ident).toBe(expected);
    });
  });
});
