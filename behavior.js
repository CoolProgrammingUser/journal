var S = Standards;
var people = [];

S.onLoad(function() {
	people.forEach(function(person, index) {
		S.getClass("p" + (index+1)).forEach(function(occurrence) {
			if (occurrence.classList.includes("full-name")) {
				occurrence.innerHTML = person.fullName;
			} else {
				occurrence.innerHTML = person.name;
			}
		});
	});
});
