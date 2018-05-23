var S = Standards.general;
var people = [];

S.onLoad(function() {
	// fills all of the empty person references with people
	let HTML = document.body.innerHTML;
	HTML = HTML.replace(/([^'"“])(p\d+)([^'"”])/g, function (match, leftCharacter, person, rightCharacter) {
		return leftCharacter + '<span class="' + person + '"></span>' + rightCharacter;
	});
	document.body.innerHTML = HTML;
	S.forEach(people.slice(1), function(person, index) {
		S.forEach(S.getClass("p" + index), function(occurrence) {
			let link = document.createElement("a");
			link.className = "discreet";
			link.href = "/journal/people?p=" + index;  // "/journal/" is included just in case the link is put in a weird place
			if (occurrence.textContent.trim() != "") {
				link.textContent = occurrence.textContent;
				occurrence.textContent = "";
			} else if (occurrence.dataset.use) {
				link.textContent = person[occurrence.dataset.use];
			} else {
				link.textContent = person.name;
			}
			occurrence.appendChild(link);
		});
	});
});
