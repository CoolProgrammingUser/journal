// fills all of the empty person references with people
// needs to run before Standards, so no listeners are removed

addEventListener("load", function () {
	// replaces p# placeholders with <span> elements
	let HTML = document.body.innerHTML;
	HTML = HTML.replace(/([^'"“])(p0?\d+(?:\.\w+)?)([^"”])/g, function (match, leftCharacter, person, rightCharacter) {
		if (person.indexOf(".") > -1) {
			return leftCharacter + '<span class="person ' + person.slice(0, person.indexOf(".")) + '" data-use="' + person.slice(person.indexOf(".") + 1) + '"></span>' + rightCharacter;
		} else {
			return leftCharacter + '<span class="person ' + person + '"></span>' + rightCharacter;
		}
	});
	document.body.innerHTML = HTML;
});
