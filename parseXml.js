const parseXml = str => {
  let result = [];
  str = removeXMLDeclaration(str);
  let {type, tagName, attrs, text, nextStr} = getNextTag(str);
  if (text) {
    result.push(textTag(text));
  }
  if (tagName && type !== 'close') {
    let tag = {name: tagName, attrs};
    if (type === 'single') {
      result.push(tag);
      result = result.concat(parseXml(nextStr));
    } else {
      let res = getTagChildren(tag, nextStr);
      tag.children = parseXml(res.content);
      result.push(tag);
      result = result.concat(parseXml(res.nextStr));
    }
  } else if (type === 'close') {
    result = result.concat(parseXml(nextStr));
  }
  return result;
};
// remove xml declaration like <?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
const removeXMLDeclaration = str => {
  return str.replace(/^\s*<\?\s*xml.*?\?\s*>/,'');
};
const  textTag = text => ({ name: "text", text });

const parseTagAttributes =  str => {
  let attrs = {};
  str = str.replace(/\s+/g,' ').trim();
  let vals = str.split(" ");
  vals.forEach(val => {
    if (val || val.trim()) {
      let kv = val.split("=");
      if (kv.length < 2) {
        throw new Error("Tag attributes parse error.");
      }
      let k = kv[0];
      let v = kv[1];
      v = v
        .replace(/^"/, "")
        .replace(/^'/, "")
        .replace(/"$/, "")
        .replace(/'$/, "");
      attrs[k] = v;
    }
  });
  return attrs;
};
getTagChildren = (tag, nextStr) => {
  let tagStack = [tag.name];
  let loop = 1000;
  let content = '';
  while(tagStack.length > 0 && nextStr && loop > 0) {
    let res = getNextTag(nextStr);
    if (res.tagName) {
      if (res.type === 'open') {
        tagStack.push(res.tagName);
      } else if (res.type === 'close') {
        tagStack.pop();
      }
    }
    content += res.content || '';
    nextStr = res.nextStr;
    loop -= 1;
  }
  if (loop === 0) {
    throw new Error('Loop error.');
  }
  return { content, nextStr };
};
const getNextTag = str => {
  let matches = str.match(/^((.*?)<\s*(.*?)\s*>)(.*)$/);
  if (matches && matches.length > 4) {
    let content = matches[1] || null;
    let text = matches[2] || null;
    let tagContent = matches[3];
    let nextStr = matches[4];
    matches = tagContent.match(/^([^\s]*)\s*(.*)$/);
    if (matches && matches.length > 1) {
      let tagName = matches[1];
      let attributesStr = matches[2];
      let type = 'open';
      if (/^\//.test(tagName)) {
        tagName = tagName.replace(/^\//, '');
        type = 'close';
      } else if (/\/$/.test(tagName) || /\/$/.test(attributesStr)) {
        tagName = tagName.replace(/\/$/, '');
        attributesStr = attributesStr.replace(/\/$/, '');
        type = 'single';
      }
      let attrs = parseTagAttributes(attributesStr);
      return {type, tagName, attrs, text, content, nextStr};
    } else {
      throw new Error('Tag parse error.');
    }
  }
  return {tagName: null, text: str, content: str, nextStr: null};

};

module.exports = parseXml;
