const parseXml = require("../parseXml");

const chai = require("chai");
describe("parseXml", () => {
  it("normal", function() {
    let xml =
      '<sample>abc<xxx a="xx"  b="yy"  ></xxx><xxx><xxx>hy<g>rr</g>u<g/>i</xxx>' +
      '</xxx>yyyyy<ttt>s</ttt><   rrrr  c="t" /></sample>';
    let result = parseXml(xml);
    let expected = [
      {
        name: "sample",
        attrs: {},
        children: [
          {
            name: "text",
            text: "abc"
          },
          {
            name: "xxx",
            attrs: {
              a: "xx",
              b: "yy"
            },
            children: []
          },
          {
            name: "xxx",
            attrs: {},
            children: [
              {
                name: "xxx",
                attrs: {},
                children: [
                  {
                    name: "text",
                    text: "hy"
                  },
                  {
                    name: "g",
                    attrs: {},
                    children: [
                      {
                        name: "text",
                        text: "rr"
                      }
                    ]
                  },
                  {
                    name: "text",
                    text: "u"
                  },
                  {
                    name: "g",
                    attrs: {}
                  },
                  {
                    name: "text",
                    text: "i"
                  }
                ]
              }
            ]
          },
          {
            name: "text",
            text: "yyyyy"
          },
          {
            name: "ttt",
            attrs: {},
            children: [
              {
                name: "text",
                text: "s"
              }
            ]
          },
          {
            name: "rrrr",
            attrs: {
              c: "t"
            }
          }
        ]
      }
    ];
    result.should.eql(expected);
  });
  it("with xml declaration", function() {
    let xml =
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
      "<foo>abc</foo>";
    let result = parseXml(xml);
    let expected = [
      {
        name: "foo",
        attrs: {},
        children: [
          {
            name: "text",
            text: "abc"
          }
        ]
      }
    ];
    result.should.eql(expected);
  });
  it("without outer tag", function() {
    let xml = "abc<foo>gg</foo>abc";
    let result = parseXml(xml);
    let expected = [
      {
        name: "text",
        text: "abc"
      },
      {
        name: "foo",
        attrs: {},
        children: [
          {
            name: "text",
            text: "gg"
          }
        ]
      },
      {
        name: "text",
        text: "abc"
      }
    ];
    result.should.eql(expected);
  });
});
