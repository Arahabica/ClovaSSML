const parseXml = require("./parseXml");

class ClovaSSML {
  /**
   * @param {object|undefined} opt
   * @param {array} opt.silentAudios like [{time: 500, url: "http://xxx.com/500.mp3"},{time: 1000, url: "http://xxx.com/1000.mp3"},]
   * @param {string} opt.lang default: ja
   * @param {array} opt.adjustSilentTime default: -200
   */
  constructor(opt) {
    opt = opt || {};
    let silentAudios = opt.silentAudios || [];
    let lang = opt.lang || 'ja';
    let adjustSilentTime = opt.adjustSilentTime;
    if (typeof adjustSilentTime === "undefined") {
      adjustSilentTime = -200;
    }
    if (silentAudios.length === 0) {
      console.warn("silent audios should be set.");
    }
    silentAudios.sort((a, b) => a.time - b.time);
    this.silentAudios = silentAudios;
    this.adjustSilentTime = adjustSilentTime;
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
    if (tag.name === "#text") {
      if (
        speeches.length > 0 &&
        speeches[speeches.length - 1].type === "PlainText"
      ) {
        speeches[speeches.length - 1].value += tag.text;
      } else {
        speeches.push(this.getTextSpeech(tag.text));
      }
    } else if (tag.name === "audio") {
      speeches.push(this.getAudioSpeech(tag.attrs.src));
    } else if (tag.name === "break") {
      let audio = this.getSilentAudio(tag.attrs.time);
      if (audio) {
        speeches.push(this.getAudioSpeech(audio.url));
      } else {
        speeches.push(this.getTextSpeech());
      }
    } else if (tag.name === "p") {
      speeches.push(this.getTextSpeech());
      speeches = this.addSpeeches(speeches, tag.children);
      speeches.push(this.getTextSpeech());
    } else {
      speeches = this.addSpeeches(speeches, tag.children);
    }
    return speeches;
  }
  getTextSpeech(text) {
    return {
      type: "PlainText",
      lang: this.lang,
      value: text || ""
    }
  }
  getAudioSpeech(url) {
    return {
      type: "URL",
      lang: "",
      value: url
    }
  }

  addSpeeches(speeches, tags) {
    if (tags) {
      tags.forEach(c => {
        speeches = this.addSpeech(speeches, c);
      });
    }
    return speeches;
  }

  getSilentAudio(str) {
    let ms = this.getSilentMs(str);
    ms = ms + this.adjustSilentTime;
    let audio = null;
    if (this.silentAudios.length > 0) {
      this.silentAudios.forEach(_audio => {
        if (_audio.time <= ms) {
          audio = _audio;
        }
      });
    }
    return audio;
  }

  getSilentMs(str) {
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
