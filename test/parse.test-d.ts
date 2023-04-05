import type { RegExpSyntaxError, ParseRegExp } from '../src/parse'

describe('Generic type `ParseRegExp` can parse raw RegExp string to AST matchers', () => {
  it('Exact string', () => {
    expectTypeOf<ParseRegExp<'foo_bar'>>().toEqualTypeOf<
      [
        {
          type: 'string'
          value: 'foo_bar'
        }
      ]
    >()
  })
  it('Non-Capture', () => {
    expectTypeOf<ParseRegExp<'(?:foo)_(?:bar_(?:baz))'>>().toEqualTypeOf<
      [
        {
          type: 'string'
          value: 'foo'
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'string'
          value: 'bar_'
        },
        {
          type: 'string'
          value: 'baz'
        }
      ]
    >()
  })
  it('Capture', () => {
    expectTypeOf<ParseRegExp<'(foo)_(bar_(baz))'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'foo'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'bar_'
            },
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'baz'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('Named Capture', () => {
    expectTypeOf<ParseRegExp<'(?<g1>foo)_(?<g2>bar_(?<g3>baz))'>>().toEqualTypeOf<
      [
        {
          type: 'namedCapture'
          name: 'g1'
          value: [
            {
              type: 'string'
              value: 'foo'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'namedCapture'
          name: 'g2'
          value: [
            {
              type: 'string'
              value: 'bar_'
            },
            {
              type: 'namedCapture'
              name: 'g3'
              value: [
                {
                  type: 'string'
                  value: 'baz'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('Backreference', () => {
    expectTypeOf<ParseRegExp<'(?<g1>foo)_(?<g2>bar_\\k<g1>)'>>().toEqualTypeOf<
      [
        {
          type: 'namedCapture'
          name: 'g1'
          value: [
            {
              type: 'string'
              value: 'foo'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'namedCapture'
          name: 'g2'
          value: [
            {
              type: 'string'
              value: 'bar_'
            },
            {
              type: 'backreference'
              value: 'g1'
            }
          ]
        }
      ]
    >()
  })
  it('CharSet, not-charSet', () => {
    expectTypeOf<ParseRegExp<'[a-z][AEIOU][^0-9#&]'>>().toEqualTypeOf<
      [
        {
          type: 'charSet'
          value: 'a-z'
        },
        {
          type: 'charSet'
          value: 'AEIOU'
        },
        {
          type: 'notCharSet'
          value: '0-9#&'
        }
      ]
    >()
  })
  it('Whitespace, non-whitespace', () => {
    expectTypeOf<ParseRegExp<'\\s\\S'>>().toEqualTypeOf<
      [
        {
          type: 'whitespace'
        },
        {
          type: 'nonWhitespace'
        }
      ]
    >()
  })
  it('AnyChar, char, non-char, ditig, non-digit', () => {
    expectTypeOf<ParseRegExp<'.\\w\\W\\d\\D'>>().toEqualTypeOf<
      [
        {
          type: 'any'
        },
        {
          type: 'char'
        },
        {
          type: 'nonChar'
        },
        {
          type: 'digit'
        },
        {
          type: 'nonDigit'
        }
      ]
    >()
  })
  it('Boundary, non-boundary', () => {
    expectTypeOf<ParseRegExp<'\\b\\B'>>().toEqualTypeOf<
      [
        {
          type: 'boundary'
        },
        {
          type: 'nonBoundary'
        }
      ]
    >()
  })
  it('NUL, horizontal/vertical  tab, carriage return. linefeed, form-feed', () => {
    expectTypeOf<ParseRegExp<'\0\t\v\r\n\f\\0\\t\\v\\r\\n\\f'>>().toEqualTypeOf<
      [{ type: 'string'; value: '\0\t\v\r\n\f\0\t\v\r\n\f' }]
    >()
  })
  it('Optional (Greedy)', () => {
    expectTypeOf<ParseRegExp<'(fo?o)_(bar)?'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'f'
            },
            {
              type: 'optional'
              greedy: true
              value: [
                {
                  type: 'string'
                  value: 'o'
                }
              ]
            },
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'optional'
          greedy: true
          value: [
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('Optional (Greedy)', () => {
    expectTypeOf<ParseRegExp<'(fo??o)_(bar)??'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'f'
            },
            {
              type: 'optional'
              greedy: false
              value: [
                {
                  type: 'string'
                  value: 'o'
                }
              ]
            },
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'optional'
          greedy: false
          value: [
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('ZeroOrMore (Greedy)', () => {
    expectTypeOf<ParseRegExp<'(fo*o)_(bar)*'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'f'
            },
            {
              type: 'zeroOrMore'
              greedy: true
              value: [
                {
                  type: 'string'
                  value: 'o'
                }
              ]
            },
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'zeroOrMore'
          greedy: true
          value: [
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('ZeroOrMore (Lazy)', () => {
    expectTypeOf<ParseRegExp<'(fo*?o)_(bar)*?'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'f'
            },
            {
              type: 'zeroOrMore'
              greedy: false
              value: [
                {
                  type: 'string'
                  value: 'o'
                }
              ]
            },
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'zeroOrMore'
          greedy: false
          value: [
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('OneOrMore (Greedy)', () => {
    expectTypeOf<ParseRegExp<'(fo+o)_(bar)+'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'f'
            },
            {
              type: 'oneOrMore'
              greedy: true
              value: [
                {
                  type: 'string'
                  value: 'o'
                }
              ]
            },
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'oneOrMore'
          greedy: true
          value: [
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('OneOrMore (Lazy)', () => {
    expectTypeOf<ParseRegExp<'(fo+?o)_(bar)+?'>>().toEqualTypeOf<
      [
        {
          type: 'capture'
          value: [
            {
              type: 'string'
              value: 'f'
            },
            {
              type: 'oneOrMore'
              greedy: false
              value: [
                {
                  type: 'string'
                  value: 'o'
                }
              ]
            },
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: '_'
        },
        {
          type: 'oneOrMore'
          greedy: false
          value: [
            {
              type: 'capture'
              value: [
                {
                  type: 'string'
                  value: 'bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('StartOf/EndOf matching string', () => {
    expectTypeOf<ParseRegExp<'^foo_bar$'>>().toEqualTypeOf<
      [
        {
          type: 'startOf'
          value: [
            {
              type: 'endOf'
              value: [
                {
                  type: 'string'
                  value: 'foo_bar'
                }
              ]
            }
          ]
        }
      ]
    >()
  })
  it('Lookahead (Positive/Negative)', () => {
    expectTypeOf<ParseRegExp<'(?!\\d)foo(?=bar)'>>().toEqualTypeOf<
      [
        {
          type: 'lookahead'
          positive: false
          value: [
            {
              type: 'digit'
            }
          ]
        },
        {
          type: 'string'
          value: 'foo'
        },
        {
          type: 'lookahead'
          positive: true
          value: [
            {
              type: 'string'
              value: 'bar'
            }
          ]
        }
      ]
    >()
  })
  it('Lookbehind (Positive/Negative)', () => {
    expectTypeOf<ParseRegExp<'(?<=\\d)foo(?<!bar)'>>().toEqualTypeOf<
      [
        {
          type: 'lookbehind'
          positive: true
          value: [
            {
              type: 'digit'
            }
          ]
        },
        {
          type: 'string'
          value: 'foo'
        },
        {
          type: 'lookbehind'
          positive: false
          value: [
            {
              type: 'string'
              value: 'bar'
            }
          ]
        }
      ]
    >()
  })
  it('Or', () => {
    expectTypeOf<ParseRegExp<'foo|(bar|)'>>().toEqualTypeOf<
      [
        {
          type: 'or'
          value: [
            [{ type: 'string'; value: 'foo' }],
            [
              {
                type: 'capture'
                value: [
                  {
                    type: 'or'
                    value: [[{ type: 'string'; value: 'bar' }], [{ type: 'string'; value: '' }]]
                  }
                ]
              }
            ]
          ]
        }
      ]
    >()
    expectTypeOf<ParseRegExp<'foo|(|bar)'>>().toEqualTypeOf<
      [
        {
          type: 'or'
          value: [
            [{ type: 'string'; value: 'foo' }],
            [
              {
                type: 'capture'
                value: [
                  {
                    type: 'or'
                    value: [[{ type: 'string'; value: '' }], [{ type: 'string'; value: 'bar' }]]
                  }
                ]
              }
            ]
          ]
        }
      ]
    >()
    expectTypeOf<ParseRegExp<'foo-bar|bar-(?:qux|quk)|ba(?:r|z)-foo'>>().toEqualTypeOf<
      [
        {
          type: 'or'
          value: [
            [
              {
                type: 'string'
                value: 'foo-bar'
              }
            ],
            [
              {
                type: 'string'
                value: 'bar-'
              },
              {
                type: 'or'
                value: [
                  [
                    {
                      type: 'string'
                      value: 'qux'
                    }
                  ],
                  [
                    {
                      type: 'string'
                      value: 'quk'
                    }
                  ]
                ]
              }
            ],
            [
              {
                type: 'string'
                value: 'ba'
              },
              {
                type: 'or'
                value: [
                  [
                    {
                      type: 'string'
                      value: 'r'
                    }
                  ],
                  [
                    {
                      type: 'string'
                      value: 'z'
                    }
                  ]
                ]
              },
              {
                type: 'string'
                value: '-foo'
              }
            ]
          ]
        }
      ]
    >()
  })
  it('Repeat exactly n times (Greedy/Lazy)', () => {
    expectTypeOf<ParseRegExp<'fo{2}o-(?:bar){3}?'>>().toEqualTypeOf<
      [
        {
          type: 'string'
          value: 'f'
        },
        {
          type: 'repeat'
          greedy: true
          from: '2'
          to: string
          value: [
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: 'o-'
        },
        {
          type: 'repeat'
          greedy: false
          from: '3'
          to: string
          value: [
            {
              type: 'string'
              value: 'bar'
            }
          ]
        }
      ]
    >()
  })
  it('Repeat n or more times (Greedy/Lazy)', () => {
    expectTypeOf<ParseRegExp<'fo{2,}o-(?:bar){3,}?'>>().toEqualTypeOf<
      [
        {
          type: 'string'
          value: 'f'
        },
        {
          type: 'repeat'
          greedy: true
          from: '2'
          to: ''
          value: [
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: 'o-'
        },
        {
          type: 'repeat'
          greedy: false
          from: '3'
          to: ''
          value: [
            {
              type: 'string'
              value: 'bar'
            }
          ]
        }
      ]
    >()
  })
  it('Repeat n to m times (Greedy/Lazy)', () => {
    expectTypeOf<ParseRegExp<'fo{2,5}o-(?:bar){3,32}?'>>().toEqualTypeOf<
      [
        {
          type: 'string'
          value: 'f'
        },
        {
          type: 'repeat'
          greedy: true
          from: '2'
          to: '5'
          value: [
            {
              type: 'string'
              value: 'o'
            }
          ]
        },
        {
          type: 'string'
          value: 'o-'
        },
        {
          type: 'repeat'
          greedy: false
          from: '3'
          to: '32'
          value: [
            {
              type: 'string'
              value: 'bar'
            }
          ]
        }
      ]
    >()
  })
})
