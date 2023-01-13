// fills all of the empty person references with people
// needs to run before Standards, so no listeners are removed

function reformatPersonNumbers(location) {
	// replaces p# placeholders with <span> elements
	let HTML = location.innerHTML;
	HTML = HTML.replace(/<.+?>|p0?\d+(?:\.\w+)?/g, function (person) {
		if (person[0] == "<" || person.search(/p0[^\d]|p0$/) > -1) {  // if an HTML tag was captured (prevents matching people number classes within tags)
			return person;
		} else if (person.indexOf(".") > -1) {  // if a special name should be used
			return '<span class="person ' + person.slice(0, person.indexOf(".")) + '" data-use="' + person.slice(person.indexOf(".") + 1) + '"></span>';
		} else {  // if the person's common name should be used
			return '<span class="person ' + person + '"></span>';
		}
	});
	// accounts for my parents not usually being referenced by name (which might cause a sentence to not start with a capital)
	HTML = HTML.replace(/<.+?>|P1/g, function (tag) {
		if (tag[0] == "<") {
			return tag;
		} else {
			return '<span class="person p1">My dad</span>';
		}
	});
	HTML = HTML.replace(/<.+?>|P2/g, function (tag) {
		if (tag[0] == "<") {
			return tag;
		} else {
			return '<span class="person p1">My mom</span>';
		}
	});
	// replaces the location's HTML
	location.innerHTML = HTML;
	return location;
}

addEventListener("load", function () {
    reformatPersonNumbers(document.body);
});
