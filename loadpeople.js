var S = Standards.general;
var server = Standards.storage.server;

var people = [];
var placeholders = [];



function identifyPeople(placeForPeople) {

	// makes sure there's a place
	switch (S.getType(placeForPeople)) {
		case "undefined":
			placeForPeople = document.body;
			break;
		case "String":
			placeForPeople = S.getId(placeForPeople);
			break;
		case "null":
		case "HTMLElement":
			// do nothing
			break;
		default:
			console.error(new TypeError("The place requesting special behavior is of an incorrect type."));
			return;
	}

	// fills all of the empty person references with people

	if (placeForPeople !== null) {  // if more is desired than just filling the people variable
		// replaces p# placeholders with <span> elements
		let HTML = placeForPeople.innerHTML;
		HTML = HTML.replace(/([^'"“])(p0?\d+(?:\.\w+)?)([^"”])/g, function (match, leftCharacter, person, rightCharacter) {
			if (person.includes(".")) {
				return leftCharacter + '<span class="person ' + person.slice(0, person.indexOf(".")) + '" data-use="' + person.slice(person.indexOf(".") + 1) + '"></span>' + rightCharacter;
			} else {
				return leftCharacter + '<span class="person ' + person + '"></span>' + rightCharacter;
			}
		});
		placeForPeople.innerHTML = HTML;
	}

	server.requireSignIn = false;
	server.recall("^websites/journal/people").then(function (list) {

		people = list;

		if (placeForPeople !== null) {  // if more is desired than just filling the people variable
			// makes all of the people references links
			S.forEach(people.slice(1), function (person, index) {
				S.forEach(placeForPeople.getElementsByClassName("p" + (index + 1)), function (occurrence) {
					let link = document.createElement("a");
					link.className = "discreet";
					if (window.location.protocol == "file:") {
						link.href = "file:///C:/Users/rtben/Documents/GitHub/journal/search.html?p=" + (index + 1);
					} else {
						link.href = "/journal/search?p=" + (index + 1);  // "/journal/" is included just in case the link is put in a weird place
					}
					//// link.target = "_blank";  // This might not be necessary.
					link.title = person.firstName + (person.lastName ? " " + person.lastName : "");  // adds a last name in the title if availible
					if (occurrence.textContent.trim() != "") {  // if the person reference already has text (if a name shouldn't be filled in)
						link.textContent = occurrence.textContent;
						occurrence.textContent = "";
					} else if (occurrence.dataset.use) {  // if a certain name of the person should be used
						if (occurrence.dataset.use.includes("extra")) {
							link.textContent = person.extraNames[Number(occurrence.dataset.use.match(/\d+/)[0]) - 1];
						} else {
							link.textContent = person[occurrence.dataset.use];
						}
					} else {  // if the person's common name should be used
						link.textContent = person.name;
					}
					link.target = "_blank";
					occurrence.appendChild(link);
				});
			});

			// handles special uses of p0 references
			// (useful for associating people who are potentially the same)
			S.forEach(placeForPeople.getElementsByClassName("p0"), function (occurrence) {
				if (occurrence.dataset.hasOwnProperty("use")) {
					let index = Number(occurrence.dataset.use.match(/^p(\d+)/)[1]);
					if (occurrence.textContent.trim() != "") {
						// do nothing
					} else if (occurrence.dataset.use.includes(".")) {
						// p#.nameToUse
						if (occurrence.dataset.use.includes("extra")) {
							occurrence.textContent = people[index].extraNames[Number(occurrence.dataset.use.match(/\.extras?(\d+)/)[1]) - 1];
						} else {
							occurrence.textContent = people[index][occurrence.dataset.use.match(/\.(\w+)/)[1]];
						}
					} else {
						occurrence.textContent = people[index].name;
					}
				}
			});
		}

		server.requireSignIn = true;
		window.dispatchEvent(new Event("loadedPeople"));
	}).catch(function (error) {
		S.makeDialog("The people couldn't be loaded.");
		console.error("The people list couldn't be loaded.");
		console.error(error);
		server.requireSignIn = true;
	});

	server.recall("^websites/journal/placeholders").then(function (list) {
		placeholders = list;
		if (placeForPeople !== null) {  // if more is desired than just filling the placeholders variable
			// makes all of the placeholder references pseudolinks
			S.forEach(placeholders.slice(1), function (person, index) {
				S.forEach(placeForPeople.getElementsByClassName("p0" + (index + 1)), function (occurrence) {
					let link = document.createElement("a");
					link.className = "discreet";
					link.href = "";
					link.target = "_blank";
					link.title = person.firstName + (person.lastName ? " " + person.lastName : "");  // adds a last name in the title if availible
					if (occurrence.textContent.trim() != "") {  // if the person reference already has text (if a name shouldn't be filled in)
						link.textContent = occurrence.textContent;
						occurrence.textContent = "";
					} else if (occurrence.dataset.use) {  // if a certain name of the person should be used
						if (occurrence.dataset.use.includes("extra")) {
							link.textContent = person.extraNames[Number(occurrence.dataset.use.match(/\d+/)[0]) - 1];
						} else {
							link.textContent = person[occurrence.dataset.use];
						}
					} else {  // if the person's common name should be used
						link.textContent = person.name;
					}
					occurrence.appendChild(link);
				});
			});
		}
		window.dispatchEvent(new Event("loadedPlaceholders"));
	}).catch(function (error) {
		S.makeDialog("The placeholders couldn't be loaded.");
		console.error("The placeholders list couldn't be loaded.");
		console.error(error);
		server.requireSignIn = true;
	});
}

// identifying the people needs to come after the document finishes loading
S.queue.add({  // This can't be S.onLoad since replacing the person references eliminates any listeners (due to replacing the HTML).
	runOrder: "first",
	function: identifyPeople
});
