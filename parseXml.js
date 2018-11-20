const DOMParser = require('xmldom').DOMParser;

const parseXml = xml => {
  xml = removeXMLDeclaration(xml);
  xml = `<xml>${xml}</xml>`;
  let doc = new DOMParser().parseFromString(xml,"application/xml");
  let result = getNodes(doc.childNodes);
  return result[0].children;
};
const getNodes = nodes => {
  let result = [];
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    let record = {name: node.nodeName};
    if (node.attributes) {
      record.attrs = getAttrs(node.attributes);
    }
    if (node.nodeName === '#text') {
      record.text = node.textContent;
    }
    if (node.childNodes && node.childNodes.length > 0) {
      record.children = getNodes(node.childNodes);
    }
    result.push(record);
  }
  return result;
};
const getAttrs = attributes => {
  let result = {};
  for(let j=0;j<attributes.length; j++) {
    let attr = attributes[j];
    result[attr.name] = attr.value;
  }
  return result;
};
// remove xml declaration like <?xml version="1.0" encoding="UTF-8" standalone="yes" ?>
const removeXMLDeclaration = str => {
  return str.replace(/^\s*<\?\s*xml.*?\?\s*>/, "");
};
module.exports = parseXml;
