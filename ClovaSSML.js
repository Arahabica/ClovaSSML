const parseXml = require("./parseXml");

class ClovaSSML {
  /**
   * @param {Array} breakAudios like [{time: 500, url: "http://xxx.com/500.mp3"},{time: 1000, url: "http://xxx.com/1000.mp3"},]
   * @param {string} lang
   */
  constructor(breakAudios, lang) {
    if (!breakAudios) {
      breakAudios = [];
      console.warn("break audios should be set.");
    }
    if (!lang) {
      lang = "ja";
    }
    breakAudios.sort((a, b) => a.time - b.time);
    this.breakAudios = breakAudios;
    this.adjustBreakTime = -200;
    this.lang = lang;
  }

  /**
   * Convert ssml to clova output speech object
   * @param {string} ssml
   * @returns {object}
   */
  convert(ssml) {
    let speeches = this.getSpeechInfoValues(ssml);
    let outputSpeech;
    if (speeches.length === 0) {
      throw new Error("messages must be set.");
    } else if (speeches.length === 1) {
      outputSpeech = {
        type: "SimpleSpeech",
        values: speeches[0]
      };
    } else {
      outputSpeech = {
        type: "SpeechList",
        values: speeches
      };
    }
    return outputSpeech;
  }

  getSpeechInfoValues(ssml) {
    let content = parseXml(ssml);
    let speeches = this.addSpeeches([], content);
    speeches = speeches.filter(
      t => !(t.type === "PlainText" && t.value.trim() === "")
    );
    speeches.forEach(speech => {
      if (speech.type === "PlainText") {
        speech.value = speech.value.trim();
      }
    });
    return speeches;
  }

  addSpeech(speeches, tag) {
    if (tag.name === "text") {
      if (
        speeches.length > 0 &&
        speeches[speeches.length - 1].type === "PlainText"
      ) {
        speeches[speeches.length - 1].value += tag.text;
      } else {
        speeches.push({
          type: "PlainText",
          lang: this.lang,
          value: tag.text
        });
      }
    } else if (tag.name === "audio") {
      speeches.push({
        type: "URL",
        lang: "",
        value: tag.attrs.src
      });
    } else if (tag.name === "break") {
      let audio = this.getBreakAudio(tag.attrs.time);
      if (audio) {
        speeches.push({
          type: "URL",
          lang: "",
          value: audio.url
        });
      } else {
        speeches.push({
          type: "PlainText",
          lang: this.lang,
          value: ""
        });
      }
    } else if (tag.name === "p") {
      speeches.push({
        type: "PlainText",
        lang: this.lang,
        value: ""
      });
      speeches = this.addSpeeches(speeches, tag.children);
      speeches.push({
        type: "PlainText",
        lang: this.lang,
        value: ""
      });
    } else {
      speeches = this.addSpeeches(speeches, tag.children);
    }
    return speeches;
  }

  addSpeeches(speeches, tags) {
    if (tags) {
      tags.forEach(c => {
        speeches = this.addSpeech(speeches, c);
      });
    }
    return speeches;
  }

  getBreakAudio(str) {
    let ms = this.getBreakMs(str);
    ms = ms + this.adjustBreakTime;
    if (this.breakAudios.length === 0) {
      return null;
    }
    let audio = null;
    this.breakAudios.forEach(_audio => {
      if (_audio.time <= ms) {
        audio = _audio;
      }
    });
    return audio;
  }

  getBreakMs(str) {
    str = str.trim();
    if (/ms$/i.test(str)) {
      return parseInt(str.replace(/ms$/, ""));
    } else if (/s$/i.test(str)) {
      return parseFloat(str.replace(/s$/, "")) * 1000;
    } else if (/sec$/i.test(str)) {
      return parseFloat(str.replace(/sec$/, "")) * 1000;
    } else {
      throw new Error("parse error");
    }
  }
}

module.exports = ClovaSSML;
