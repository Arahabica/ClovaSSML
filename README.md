# ClovaSSML

convert SSML to Clova's OutputSpeech object.

### Clova's OutputSpeech object

[Clova Official Document](https://clova-developers.line.biz/guide/CEK/References/CEK_API.md#message-fields-2)

Clova's OutputSpeech object is used at

* `response.outputSpeech`
* `response.reprompt.outputSpeech`


### Usage

Download [silent mp3 audios.](https://github.com/Arahabica/silent-mp3). (this is used for break tag)

And host mp3 audios on your server.

```
// set silent audios infos
const silentAudios = [];
for(let time=100; time<=5000; time+= 100) {
  silentAudios.push({time, url: `YOUR_AUDIO_BASE_URL/silence${time}.mp3`});
}
let ssml = '<speak>Hello! <break time='0.3s' /> How are you?</speak>';
let clovaSSML = new ClovaSSML({silentAudios});
let outputSpeech = clovaSSML.convert(ssml);
```

Replace `YOUR_AUDIO_BASE_URL` to your audio base url.

### Notice

This library only support audio, break, p tags.

Other tags is just ignored and used inner content.
