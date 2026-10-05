import { iterateXMLContent } from "../../xml/iterate.js";
import { parseXMLContent } from "../../xml/parse.js";
import { stringifyXMLContent } from "../../xml/stringify.js";
import { splitClassName } from "../../classname/toggle.js";
import { changeSVGIDs } from "../../svg/ids/change.js";
/**
* Change class names in icon
*
* Optionally change IDs in icon if idsCallback is provided
*/
function changeSVGCSSIconClassnames(icon, callback, idsCallback) {
	const newClassNames = /* @__PURE__ */ new Map();
	const root = parseXMLContent(icon.content);
	if (!root) return icon;
	iterateXMLContent(root, (node) => {
		if (node.type === "tag" && typeof node.attribs["class"] === "string") {
			const classNames = splitClassName(node.attribs["class"]).map((className) => {
				const renamed = newClassNames.get(className);
				if (renamed) return renamed;
				const newName = callback(className);
				if (newName) {
					newClassNames.set(className, newName);
					return newName;
				}
				return className;
			});
			node.attribs["class"] = classNames.join(" ");
		}
	});
	if (idsCallback) changeSVGIDs(root, idsCallback);
	const content = stringifyXMLContent(root);
	if (!content) return icon;
	const newIcon = {
		...icon,
		content
	};
	for (const key of [
		"classes",
		"statefulClasses",
		"animations"
	]) {
		const data = icon[key];
		if (data) {
			const newData = Object.create(null);
			for (const className in data) {
				const newName = newClassNames.get(className) ?? className;
				newData[newName] = data[className];
			}
			newIcon[key] = newData;
		}
	}
	return newIcon;
}
export { changeSVGCSSIconClassnames };
