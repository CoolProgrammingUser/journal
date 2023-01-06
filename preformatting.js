// fills all of the empty person references with people
// needs to run before Standards, so no listeners are removed

addEventListener("load", function () {
	// replaces p# placeholders with <span> elements
	let HTML = document.body.innerHTML;
	HTML = HTML.replace(/([^'"“])(p0?\d+(?:\.\w+)?)([^"”])/g, function (match, leftCharacter, person, rightCharacter) {  //// search better
		if (person.indexOf(".") > -1) {
			return leftCharacter + '<span class="person ' + person.slice(0, person.indexOf(".")) + '" data-use="' + person.slice(person.indexOf(".") + 1) + '"></span>' + rightCharacter;
		} else {
			return leftCharacter + '<span class="person ' + person + '"></span>' + rightCharacter;
		}
	});
	// accounts for my parents not usually being referenced by name (which might cause a sentence to not start with a capital)
	HTML = HTML.replace(/([^'"“])P1([^"”])/g, function (match, leftCharacter, rightCharacter) {
		return leftCharacter + '<span class="person p1">My dad</span>' + rightCharacter;
	});
	HTML = HTML.replace(/([^'"“])P2([^"”])/g, function (match, leftCharacter, rightCharacter) {
		return leftCharacter + '<span class="person p2">My mom</span>' + rightCharacter;
	});
	document.body.innerHTML = HTML;
});
