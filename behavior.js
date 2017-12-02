var S = Standards;
var people = [];

S.onLoad(function() {
	// fills all of the empty person references with people
	S.forEach(people, function(person, index) {
		S.forEach(S.getClass("p" + (index+1)), function(occurrence) {
			let link = document.createElement("a");
			link.className = "discreet";
			link.href = "/journal/people";  // "/journal/" is included just in case the link is put in a weird place
			//// see if I can put the person's reference in the URL
			if (occurrence.innerHTML.trim() != "") {
				link.innerHTML = occurrence.innerHTML;
				occurrence.innerHTML = "";
			} else if (occurrence.classList.contains("full-name")) {
				link.innerHTML = person.fullName;
			} else {
				link.innerHTML = person.name;
			}
			occurrence.appendChild(link);
		});
	});
});
