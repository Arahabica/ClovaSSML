const ClovaSSML = require("../ClovaSSML");

const chai = require("chai");

let should = chai.should();
// set silent audios infos
const silentAudios = [];
for(let time=100; time<=5000; time+= 100) {
  silentAudios.push({time, url: `https;//xxx.xx/silence${time}.mp3`});
}

describe("ClovaSSML", () => {
  describe("#convert", () => {
    it("SimpleSpeech", function() {
      let converter = new ClovaSSML({silentAudios});
      let ssml =
        '<speak>Hello! <prosody rate="120%">Clova.</prosody> xx.</speak>';
      let result = converter.convert(ssml);
      let expected = {
        type: "SimpleSpeech",
        values: { type: "PlainText", lang: "ja", value: "Hello! Clova. xx." }
      };
      result.should.eql(expected);
    });
    it("SpeechList", function() {
      let converter = new ClovaSSML({silentAudios});
      let ssml =
        '<speak>Hello!<break time="1.2s" /> ' +
        '<p>My name is <prosody rate="120%">Clova.</prosody></p>' +
        "<p>I am from <s>XXXX</s>.</p>" +
        '<audio src="https://xxxx.xx/xx.mp3" />' +
        'yyyyyy.<break  time="200ms" />tttt.' +
        '<audio src="https://xxxx.xx/yy.mp3" />' +
        "<p>AAAA <s>BBBB</s>.</p>" +
        "</speak>";
      let result = converter.convert(ssml);
      let expected = {
        type: "SpeechList",
        values: [
          { type: "PlainText", lang: "ja", value: "Hello!" },
          {
            lang: "",
            type: "URL",
            value: "https;//xxx.xx/silence1000.mp3"
          },
          {
            type: "PlainText",
            lang: "ja",
            value: "My name is Clova."
          },
          {
            type: "PlainText",
            lang: "ja",
            value: "I am from XXXX."
          },
          { type: "URL", lang: "", value: "https://xxxx.xx/xx.mp3" },
          { type: "PlainText", lang: "ja", value: "yyyyyy." },
          { type: "PlainText", lang: "ja", value: "tttt." },
          { type: "URL", lang: "", value: "https://xxxx.xx/yy.mp3" },
          { type: "PlainText", lang: "ja", value: "AAAA BBBB." }
        ]
      };
      result.should.eql(expected);
    });

    it("with xml declaration", function() {
      let converter = new ClovaSSML({silentAudios});
      let ssml =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<speak>Hello! <prosody rate="120%">Clova.</prosody></speak>';
      let result = converter.convert(ssml);
      let expected = {
        type: "SimpleSpeech",
        values: { type: "PlainText", lang: "ja", value: "Hello! Clova." }
      };
      result.should.eql(expected);
    });
    it("without speak tag", function() {
      let converter = new ClovaSSML({silentAudios});
      let ssml = 'Hello! <prosody rate="120%">Clova.</prosody>';
      let result = converter.convert(ssml);
      let expected = {
        type: "SimpleSpeech",
        values: { type: "PlainText", lang: "ja", value: "Hello! Clova." }
      };
      result.should.eql(expected);
    });
  });
});
