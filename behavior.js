var S = Standards.general;
var people = [];

S.onLoad(function() {
	// fills all of the empty person references with people
	S.forEach(people, function(person, index) {
		S.forEach(S.getClass("p" + (index+1)), function(occurrence) {
			let link = document.createElement("a");
			link.className = "discreet";
			link.href = "/journal/people?p=" + (index+1);  // "/journal/" is included just in case the link is put in a weird place
			if (occurrence.innerHTML.trim() != "") {
				link.innerHTML = occurrence.innerHTML;
				occurrence.innerHTML = "";
			} else if (occurrence.dataset.use) {
				link.innerHTML = person[occurrence.dataset.use];
			} else {
				link.innerHTML = person.name;
			}
			occurrence.appendChild(link);
		});
	});
});
