/**
* Parse fallback template string into array of strings and states
*/
function parseIconFallbackTemplate(fallback, states) {
	const chunks = [];
	const unwrap = (value) => value.startsWith("'") && value.endsWith("'") ? value.slice(1, -1) : value;
	let startIndex = 0;
	for (const match of fallback.matchAll(/{[^}]+}/g)) {
		const matchText = match[0];
		const matchIndex = match.index || 0;
		if (matchIndex > startIndex) {
			const prev = fallback.slice(startIndex, matchIndex);
			if (prev) chunks.push(prev);
		}
		startIndex = matchIndex + matchText.length;
		const textMatches = Array.from(matchText.matchAll(/[a-z0-9:'-]+/g));
		if (!textMatches.length) return;
		const separators = Array.from(matchText.matchAll(/[^a-z0-9:'-]/g));
		if (separators.length !== textMatches.length + 1) return;
		const stateName = textMatches[0][0].trim();
		const state = states.find((s) => typeof s === "string" ? s === stateName : s[0] === stateName);
		if (!state) return;
		if (typeof state === "string") {
			const isShortcut = textMatches.length === 1;
			if (!isShortcut && textMatches.length !== 3) return;
			const trueValue = isShortcut ? state : textMatches[1][0];
			const falseValue = isShortcut ? "" : textMatches[2][0];
			if (!isShortcut) {
				const firstSeparator = separators[1][0];
				const secondSeparator = separators[2][0];
				if (firstSeparator !== "?" || secondSeparator !== "|") return;
			}
			chunks.push({
				state,
				values: [unwrap(falseValue), unwrap(trueValue)]
			});
		} else {
			if (textMatches.length > 1) return;
			chunks.push({ state: stateName });
		}
	}
	if (startIndex < fallback.length) chunks.push(fallback.slice(startIndex));
	return chunks;
}
export { parseIconFallbackTemplate };
