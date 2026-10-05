/**
* Generate fallback string from template and states
*/
function getIconFallback(template, values, defaultValues, prefix = "") {
	const addPrefix = (value) => value && typeof value === "string" && prefix && !value.startsWith(prefix) ? prefix + value : value;
	const stateValue = (state) => values[state] ?? defaultValues?.[state];
	return template.map((chunk) => typeof chunk === "string" ? chunk : addPrefix("values" in chunk ? chunk.values[+!!stateValue(chunk.state)] : stateValue(chunk.state))).join("");
}
export { getIconFallback };
