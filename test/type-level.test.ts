import type { EnumerateMatchers } from '../src/match'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type testing = EnumerateMatchers<
  //  ^?
  '"123"456"', //'a572894973826367301751bdr3', // 'tt22a7?', //'123456789D', //'"12"34"', //'"1"23"526"', //'!a7u8z9?dw', //'!a7?', //'a3xa7za2x;lk', //'xsa3cbb', //'1b9x72!3z42',
  [
    //? testing any
    {
      type: 'namedCapture'
      name: 'all'
      value: [
        { type: 'string'; value: '"' },
        {
          type: 'namedCapture'
          name: 'content'
          value: [{ type: 'zeroOrMore'; greedy: true; value: [{ type: 'any' }] }]
        },
        { type: 'string'; value: '"' }
      ]
    }

    // ? testing repeat   test case: 'a572894973826367301751bdr32'
    // {
    //   type: 'namedCapture'
    //   name: 'g0'
    //   value: [{ type: 'charSet'; value: 'a-z' }]
    // },
    // {
    //   type: 'repeat'
    //   from: '2'
    //   to: ''
    //   greedy: false
    //   value: [
    //     {
    //       type: 'namedCapture'
    //       name: 'g1'
    //       value: [
    //         {
    //           type: 'or'
    //           value: [
    //             [
    // {
    //   type: 'namedCapture'
    //   name: 'g2'
    //   value: [{ type: 'charSet'; value: '0-4' }]
    // }
    //             ],
    //             [{ type: 'charSet'; value: '5-9' }]
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // }

    // {
    //   type: 'repeat'
    //   from: '3'
    //   to: string
    //   greedy: true
    //   value: [
    //     { type: 'digit' },
    //     {
    //       type: 'or'
    //       value: [[{ type: 'charSet'; value: '0-9' }], [{ type: 'charSet'; value: 'a-z' }]]
    //     }
    //   ]
    // }

    // ? testing optional /w greedy ,and for repeat expanded optional
    // { type: 'string'; value: '!' },
    // {
    //   //? test case string: 'tt22a7?'
    //   type: 'optional'
    //   greedy: true
    //   repeat: [['', ''], '4']
    //   value: [
    // {
    //   type: 'namedCapture'
    //   name: 'g1'
    //   value: [
    //     {
    //       type: 'or'
    //       value: [
    //         [
    //           {
    //             type: 'namedCapture'
    //             name: 'g2'
    //             value: [{ type: 'string'; value: '2' }]
    //           }
    //         ],
    //         [{ type: 'string'; value: '3' }]
    //       ]
    //     }
    //   ]
    // }
    //   ]
    // }
    // { type: 'string'; value: '3' }
    // { type: 'string'; value: 'a' },

    // { type: 'string'; value: '!' },
    // {
    //   type: 'optional'
    //   greedy: false
    //   repeat: false
    //   value: [
    //     { type: 'capture'; value: [{ type: 'charSet'; value: 'a-z' }] },
    //     { type: 'namedCapture'; name: 'g1'; value: [{ type: 'digit' }] }
    //   ]
    // },
    // { type: 'string'; value: '?' }

    // ? testing any(.) with greedy/lazy quantifiers
    // {
    //   //? test string: "123456789D" should match "56789D", guess have to remove # of chars equals "to minus from" from partial matched during exhaustive matching
    //   type: 'repeat'
    //   from: '1'
    //   to: '5'
    //   greedy: true
    //   value: [{ type: 'charSet'; value: '"1-9' }]
    // },
    // { type: 'string'; value: 'D' }

    // { type: 'namedCapture'; name: 'g0'; value: [{ type: 'string'; value: '"' }] }, //?test string: "12"34"
    // {
    //   type: 'namedCapture'
    //   name: 'outmost'
    //   value: [
    //     {
    //       type: 'zeroOrMore'
    //       greedy: true
    //       value: [
    //         {
    //           type: 'namedCapture'
    //           name: 'g1'
    //           value: [
    //             {
    //               type: 'repeat'
    //               from: '1'
    //               to: '2'
    //               greedy: true
    //               value: [{ type: 'charSet'; value: '"1-6' }]
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   ]
    // },
    // { type: 'string'; value: '"' }

    // { type: 'namedCapture'; name: 'g0'; value: [{ type: 'string'; value: '"' }] },
    // {
    //   type: 'namedCapture'
    //   name: 'outmost'
    //   value: [
    //     {
    //       type: 'zeroOrMore'
    //       greedy: true
    //       value: [{ type: 'namedCapture'; name: 'g1'; value: [{ type: 'charSet'; value: '"1-6' }] }]
    //     }
    //   ]
    // },
    // { type: 'string'; value: '"' }

    // //? testing zeroOrMore /w greedy
    // { type: 'string'; value: '!' },
    // {
    //   type: 'capture'
    //   value: [
    //     {
    //       type: 'zeroOrMore'
    //       greedy: true
    //       value: [
    //         { type: 'capture'; value: [{ type: 'charSet'; value: 'a-z' }] },
    //         { type: 'namedCapture'; name: 'g1'; value: [{ type: 'digit' }] }
    //       ]
    //     }
    //   ]
    // },
    // { type: 'string'; value: '?' }

    // ? testing optional /w greedy
    // {
    //   type: 'optional'
    //   greedy: true
    //   repeat: false
    //   value: [{ type: 'string'; value: '2' }]
    // }

    // { type: 'string'; value: '!' },
    // {
    //   type: 'optional'
    //   greedy: true
    //   repeat: false
    //   value: [
    //     { type: 'capture'; value: [{ type: 'charSet'; value: 'a-z' }] },
    //     { type: 'namedCapture'; name: 'g1'; value: [{ type: 'digit' }] }
    //   ]
    // }
    // { type: 'string'; value: '?' }

    // ? testing repeat
    // {
    //   type: 'repeat'
    //   from: '3'
    //   to: string
    //   greedy: true
    //   value: [
    //     { type: 'digit' },
    //     {
    //       type: 'or'
    //       value: [[{ type: 'charSet'; value: '0-9' }], [{ type: 'charSet'; value: 'a-z' }]]
    //     }
    //   ]
    // }

    // ? testing or
    // { type: 'string'; value: 'a' },
    // {
    //   type: 'capture'
    //   value: [
    //     {
    //       type: 'or'
    //       value: [
    //         [
    //           { type: 'string'; value: '1' },
    //           {
    //             type: 'namedCapture'
    //             name: 'g1'
    //             value: [{ type: 'string'; value: '2' }]
    //           }
    //         ],
    //         [
    //           {
    //             type: 'capture'
    //             value: [{ type: 'string'; value: '3' }, { type: 'charSet'; value: 'a-d' }]
    //           }
    //         ]
    //       ]
    //     }
    //   ]
    // },
    // { type: 'string'; value: 'b' }

    // ? testing repeat
    // {
    //   type: 'repeat'
    //   from: '2'
    //   to: '5'
    //   greedy: true
    //   value: [
    //     { type: 'or'; value: [[{ type: 'string'; value: 'a' }], [{ type: 'string'; value: 'b' }]] },
    //     { type: 'capture'; value: [{ type: 'digit' }] },
    //     { type: 'namedCapture'; name: 'g1'; value: [{ type: 'charSet'; value: 's-z' }] }
    //   ]
    // }

    // ? testing captrue / namedCaptrues
    // { type: 'string'; value: 'a' },
    // {
    //   type: 'optional'
    //   greedy: true
    //   repeat: false
    //   value: [
    //     { type: 'string'; value: '1' },
    //     {
    //       type: 'namedCapture'
    //       name: 'g1'
    //       value: [{ type: 'string'; value: '2' }]
    //     },
    //     {
    //       type: 'capture'
    //       value: [{ type: 'string'; value: '3' }]
    //     }
    //   ]
    // },
    // { type: 'string'; value: 'b' },
    // { type: 'backreference'; value: 'g1' },
    // { type: 'string'; value: 'c' }

    // {
    //   type: 'capture'
    //   value: [
    //     { type: 'string'; value: '1' },
    //     {
    //       type: 'namedCapture'
    //       name: 'g1'
    //       value: [
    //         { type: 'string'; value: '2' },
    //         { type: 'charSet'; value: 'T-Z' },
    //         {
    //           type: 'namedCapture'
    //           name: 'g2'
    //           value: [
    //             { type: 'charSet'; value: '1-5' },
    //             {
    //               type: 'capture'
    //               value: [{ type: 'charSet'; value: '6-9' }]
    //             }
    //           ]
    //         }
    //       ]
    //     },
    //     { type: 'charSet'; value: 'a-d' }
    //   ]
    // }

    // ? testing string/char/digit..., and boundary
    // { type: 'boundary' },
    // { type: 'string'; value: '1' },
    // { type: 'charSet'; value: '*&#a-c' },
    // { type: 'digit' },
    // { type: 'nonDigit' },
    // { type: 'notCharSet'; value: 'B-D12345' },
    // { type: 'string'; value: '2' },
    // { type: 'boundary' },
    // { type: 'nonChar' },
    // { type: 'char' },
    // { type: 'string'; value: 'z' }
  ]
>

//
//
// type testMatch = MatchRegexp<InputString, TargetResultMatcher>
// type testMatch = EnumerateMatchers<InputString, TargetResultMatcher>
//     ^?

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type InputString = `prefix1	a1	
2Box4D4t3@D4I7+y15y3Sy5_G-7F-R4*59ox4$z`
// regexp: 1\t\n\d((?:b|B(?<group1>\D(x(?<group2>\d)))D)(?:4(t)\d\b\W)?)[246abC-I]+(7[^A-D](y\d\w)+(F-\w|G-\d){2}\k<group2>(?:[$-*5]|9){1,3}\k<group1>)
// should result: ["1\t\n2Box4D4t3@D4I7+y15y3Sy5_G-2F-R4*59ox4", "Box4D4t3@", "ox4", "x4", "4", "t", "7+y15y3Sy5_G-2F-R4*59ox4", "y5_", "F-R"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type TargetResultMatcher = [
  {
    type: 'string'
    value: '1\t\n' // '1\t\n'
  },
  {
    type: 'digit'
  },
  {
    type: 'capture'
    value: [
      {
        type: 'or'
        value: [
          [
            {
              type: 'string'
              value: 'b'
            }
          ],
          [
            {
              type: 'string'
              value: 'B'
            },
            {
              type: 'namedCapture'
              name: 'group1'
              value: [
                {
                  type: 'nonDigit'
                },
                {
                  type: 'capture'
                  value: [
                    {
                      type: 'string'
                      value: 'x'
                    },
                    {
                      type: 'namedCapture'
                      name: 'group2'
                      value: [
                        {
                          type: 'digit'
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              type: 'string'
              value: 'D'
            }
          ]
        ]
      },
      {
        type: 'optional'
        greedy: true
        value: [
          {
            type: 'string'
            value: '4'
          },
          {
            type: 'capture'
            value: [
              {
                type: 'string'
                value: 't'
              }
            ]
          },
          {
            type: 'digit'
          },
          {
            type: 'boundary'
          },
          {
            type: 'nonChar'
          }
        ]
      }
    ]
  },
  {
    type: 'zeroOrMore'
    greedy: true
    value: [
      {
        type: 'charSet'
        value: '246abC-I'
      }
    ]
  },
  {
    type: 'capture'
    value: [
      {
        type: 'string'
        value: '7'
      },
      {
        type: 'notCharSet'
        value: 'A-D'
      },
      {
        type: 'zeroOrMore'
        greedy: true
        value: [
          {
            type: 'capture'
            value: [
              { type: 'string'; value: 'y' },
              { type: 'digit' },
              {
                type: 'char'
              }
            ]
          }
        ]
      },
      {
        type: 'repeat'
        from: '2'
        to: string
        greedy: true
        value: [
          {
            type: 'capture'
            value: [
              {
                type: 'or'
                value: [
                  [
                    {
                      type: 'string'
                      value: 'F-'
                    },
                    {
                      type: 'char'
                    }
                  ],
                  [
                    {
                      type: 'string'
                      value: 'G-'
                    },
                    {
                      type: 'digit'
                    }
                  ]
                ]
              }
            ]
          }
        ]
      },
      {
        type: 'backreference'
        value: 'group2'
      },
      {
        type: 'repeat'
        from: '1'
        to: '3'
        greedy: true
        value: [
          {
            type: 'or'
            value: [
              [
                {
                  type: 'charSet'
                  value: '$-*5'
                }
              ],
              [
                {
                  type: 'string'
                  value: '9'
                }
              ]
            ]
          }
        ]
      },
      {
        type: 'backreference'
        value: 'group1'
      }
    ]
  }
]

//
//
// type tes =
//   //  ^?
//   ExhaustiveMatch<
//     '4514', //'a6712dgbfedg34', //'1abc34dgbde34', //'abc%231z', //'A+abc-d3 d3abc-d3Dzz', //'ab+G-4x sz', //'-^a2x9z9goodG-32goodsdwe9G-2goodF-A', //'-^a29xgood9',
//     [
//       // { type: 'string'; value: '1' },
//       {
//         type: 'optional'
//         greedy: true
//         repeat: false
//         value: [
//           { type: 'capture'; value: [{ type: 'string'; value: '2' }] },
//           { type: 'string'; value: '3' }
//         ]
//       },
//       { type: 'string'; value: '4' }

//       // { type: 'backreference'; value: 'g1' }
//       // {
//       //   type: 'capture'
//       //   value: [
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' }
//       //   ]
//       // },
//       // {
//       //   type: 'capture'
//       //   value: [
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' },
//       //     { type: 'string'; value: '1' }
//       //   ]
//       // }

//       // {
//       //   type: 'or'
//       //   value: [
//       //     [{ type: 'string'; value: '1' }, { type: 'string'; value: '23' }],
//       //     [{ type: 'string'; value: '1' }, { type: 'string'; value: '33' }]
//       //   ]
//       // }

//       // {
//       //   type: 'repeat'
//       //   from: '2'
//       //   to: '4'
//       //   greedy: true
//       //   value: [
//       //     // { type: 'string'; value: '1' }
//       //     {
//       //       type: 'capture'
//       //       // value: [{ type: 'string'; value: 'x' }]
//       //       value: [{ type: 'string'; value: '1' }]
//       //     },
//       //     {
//       //       type: 'namedCapture'
//       //       name: 'g1'
//       //       value: [
//       //         {
//       //           type: 'or'
//       //           value: [
//       //             [
//       //               {
//       //                 type: 'capture'
//       //                 value: [{ type: 'string'; value: '2' }]
//       //               }
//       //             ],
//       //             [{ type: 'string'; value: '3' }]
//       //           ]
//       //         }
//       //       ]
//       //     }
//       //   ]
//       // }

//       // {
//       //   type: 'string'
//       //   value: '2'
//       // },
//       // {
//       //   type: 'zeroOrMore'
//       //   greedy: false
//       //   value: [
//       //     {
//       //       type: 'namedCapture'
//       //       name: 'g1'
//       //       value: [
//       //         {
//       //           type: 'char'
//       //         }
//       //       ]
//       //     }
//       //   ]
//       // }

//       // {
//       //   type: 'or'
//       //   value: [
//       //     [
//       //       {
//       //         type: 'string'
//       //         value: 'd'
//       //       },
//       //       {
//       //         type: 'charSet'
//       //         value: 'eg'
//       //       }
//       //     ],
//       //     [
//       //       {
//       //         type: 'string'
//       //         value: '34'
//       //       }
//       //     ]
//       //   ]
//       // }

//       // { type: 'boundary' },
//       // { type: 'string'; value: 'bc' },
//       // { type: 'char' }
//       // { type: 'nonChar' }
//       // { type: 'charSet'; value: '!-~' }
//       // { type: 'notCharSet'; value: '!-~' }
//       // { type: 'digit' }
//       // { type: 'nonDigit' }
//       // { type: 'boundary' },
//       // { type: 'charSet'; value: '!-/' }

//       // {
//       //   type: 'endOf'
//       //   value: [
//       //     // { type: 'char' }
//       //     // { type: 'charSet'; value: 'x' | 'y' | 'z' },
//       //     // { type: 'string'; value: 'z9' }
//       //     // { type: 'digit' }
//       //     { type: 'repeat'; from: 1; to: ''; value: [{ type: 'string'; value: 'good' }] }
//       //   ]
//       // }

//       // {
//       //   type: 'or'
//       //   value: [
//       //     [
//       //       {
//       //         type: 'string'
//       //         value: 'F-'
//       //       },
//       //       {
//       //         type: 'char'
//       //       }
//       //     ],
//       //     [
//       //       {
//       //         type: 'capture'
//       //         value: [
//       //           {
//       //             type: 'string'
//       //             value: 'a'
//       //           }
//       //         ]
//       //       },
//       // {
//       //   type: 'capture'
//       //   value: [
//       //     {
//       //       type: 'string'
//       //       value: 'b'
//       //     }
//       //   ]
//       // }
//       //     ],
//       //     [
//       //       {
//       //         type: 'capture'
//       //         value: [
//       //           {
//       //             type: 'string'
//       //             value: 'G-'
//       //           },
//       //           {
//       //             type: 'capture'
//       //             value: [
//       //               {
//       //                 type: 'digit'
//       //               }
//       //             ]
//       //           }
//       //         ]
//       //       }
//       //     ]
//       //   ]
//       // }
//     ]
//   >
