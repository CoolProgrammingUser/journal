// fills all of the empty person references with people
// needs to run before Standards, so no listeners are removed
//// also replaces ampersands with things that look more like my handwriting while I don't have a suitable font

function reformatPersonNumbers(location) {
	let HTML = location.innerHTML;
	// replaces ordinary ampersands with ones that look like mine
	HTML = HTML.replace(/&amp;(?!\w|#)/g, '<span class="ampersand-hack" aria-label="&">&#10802;</span>');
	// replaces p# placeholders with <span> elements
	HTML = HTML.replace(/<.+?>|[pP]0?\d+(?:\.\w+(?:\([^)]*\))?)*/g, function (person) {
		if (person[0] == "<" || person.search(/[pP]0[^\d]|[pP]0$/) > -1) {  // if an HTML tag or p0 was captured (prevents matching people number classes within tags)
			return person;
		} else if (person.indexOf(".") > -1) {  // if a special name should be used
			return '<span class="person ' + person.slice(0, person.indexOf(".")) + '" data-use="' + person.slice(person.indexOf(".") + 1) + '"></span>';
		} else {  // if the person's common name should be used
			return '<span class="person ' + person + '"></span>';
		}
	});
	// replaces the location's HTML
	location.innerHTML = HTML;
	return location;
}

function idParagraphs(searchZone) {
	if (!searchZone) {
		searchZone = document.body;
	}
	S.forEach(searchZone.getElementsByClassName("entry"), function (entry) {
		S.forEach(entry.getElementsByTagName("section"), function (section, index) {
			if (!section.id) {  // if the paragraph doesn't already have an ID
				section.id = entry.dataset.date + "p" + (index + 1);
			}
		});
	});
}

addEventListener("load", function () {
	reformatPersonNumbers(document.body);
	idParagraphs();
});
