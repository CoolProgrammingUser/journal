var S = Standards.general;
var server = Standards.storage.server;

var people = [];
var placeholders = [];



(function () {  // makes a separate event fire when all people have been loaded
	let listsToLoad = 2;
	let incrementProgress = function () {
		listsToLoad--;
		if (listsToLoad == 0) {
			window.dispatchEvent(new Event("loadedAllPeople"));
		}
	};
	addEventListener("loadedPeople", incrementProgress);
	addEventListener("loadedPlaceholders", incrementProgress);
})();

function replacePersonReference(location, options) {
	let number;
	let person;
	switch (S.getType(location)) {
		case "undefined":
			console.error("No location to replace was specified.");
			return;
		case "HTMLElement":
			number = location.className.match(/p(\d+)/);
			if (!number) {
				console.error("The person number couldn't be found.");
				return;
			}
			number = number[1];
			if (number == "0") {
				console.warn("An attempt was made to replace an unidentified person.");
				return;
			} else if (number[0] == "0") {  // if wanting to replace a person placeholder
				person = placeholders[Number(number)];
			} else {
				person = people[Number(number)];
			}

			if (options === undefined) {
				options = {};
			}
			break;
		case "String":
			number = location.match(/p(\d+)/);
			if (!number) {
				console.error("The person number couldn't be found.");
				return;
			}
			break;
		default:
			console.error("The provided location was an incorrect type.");
			return;
	}

	if (location instanceof Element) {  // if modifying an HTML element

		let link = document.createElement("a");
		if (window.location.protocol == "file:") {
			link.href = "file:///C:/Users/rtben/Documents/GitHub/journal/search.html?p=" + number;
		} else {
			link.href = "/journal/search?p=" + number;  // "/journal/" is included to make sure the link navigates correctly no matter where it is
		}
		//// link.target = "_blank";  // This might not be necessary.
		link.title = person.firstName + (person.lastName ? " " + person.lastName : "");  // adds a last name in the title if availible
		if (location.textContent.trim() != "") {  // if the person reference already has text (if a name shouldn't be filled in)
			link.textContent = location.textContent;
			location.textContent = "";
		} else if (location.dataset.use) {  // if a certain name of the person should be used
			if (location.dataset.use.includes("extra")) {
				link.textContent = person.extraNames[Number(location.dataset.use.match(/\d+/)[0]) - 1];
			} else {
				link.textContent = person[location.dataset.use];
			}
		} else {  // if the person's common name should be used
			link.textContent = person.name;
		}
		link.target = "_blank";

		location.textContent = link.textContent;
		location.title = link.title;
		link.textContent = person.name;
		link.title = "";
		S.listen(location, "click", function () {  // makes a dialog about the person on click
			S.makeDialog(link.outerHTML + " (p" + number + ")<br>" + person.firstName + (person.lastName ? " " + person.lastName : ""));
		});
	} else {  // if returning a modified string
		S.forEach(location.match(/p\d+(?:\.\w+)?/g), function (match) {
			if (match[1] == "0") {  // if wanting to replace a person placeholder (p0#)
				person = placeholders[Number(match.match(/p0(\d+)/)[1])];
			} else {
				person = people[Number(match.match(/p(\d+)/)[1])];
			}
			let specialName = match.match(/\.(\w+)/);
			if (specialName) {  // if a different name should be used than the common name
				specialName = specialName[1];
				if (specialName.includes("extra")) {
					location = location.replace(match, person.extraNames[Number(specialName.match(/\d+/)[0]) - 1]);
				} else {
					location = location.replace(match, person[specialName]);
				}
			} else {  // if the common name should be used
				location = location.replace(match, person.name);
			}
		});
		return location;
	}
}

function identifyPeople(placeForPeople, options) {
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

	if (!options) {
		options = {};
	}
	options.loadPeople = (options.loadPeople === undefined ? true : options.loadPeople);

	function replacePeople() {
		// makes all of the people references pseudolinks
		S.forEach(people.slice(1), function (person, index) {
			S.forEach(placeForPeople.getElementsByClassName("p" + (index + 1)), function (occurrence) {
				replacePersonReference(occurrence);
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

	function replacePlaceholders() {
		// makes all of the placeholder references pseudolinks
		S.forEach(placeholders.slice(1), function (person, index) {
			S.forEach(placeForPeople.getElementsByClassName("p0" + (index + 1)), function (occurrence) {
				replacePersonReference(occurrence);
			});
		});
	}

	if (options.loadPeople) {
		let originalServerStorageLocation = Standards.storage.server.defaultLocation;
		server.defaultLocation = "^websites/journal/";  // needed to prevent checking for a user

		// loads the people
		server.recall("people", null, { requireSignIn: false }).then(function (list) {
			people = list;
			if (placeForPeople !== null) {  // if more is desired than just filling the people variable
				replacePeople();
			}
			window.dispatchEvent(new Event("loadedPeople"));
		}).catch(function (error) {
			S.makeDialog("The people couldn't be loaded.");
			console.error("The people list couldn't be loaded.");
			console.error(error);
		});

		server.recall("placeholders", null, { requireSignIn: false }).then(function (list) {
			placeholders = list;
			if (placeForPeople !== null) {  // if more is desired than just filling the placeholders variable
				replacePlaceholders();
			}
			window.dispatchEvent(new Event("loadedPlaceholders"));
		}).catch(function (error) {
			S.makeDialog("The people placeholders couldn't be loaded.");
			console.error("The placeholders list couldn't be loaded.");
			console.error(error);
		});

		server.defaultLocation = originalServerStorageLocation;

	} else {
		replacePeople();
		replacePlaceholders();
		return placeForPeople;
	}
}

addEventListener("loadedAllPeople", function () {
	S.forEach(S.getTag("aside"), function (aside) {
		if (aside.dataset.hasOwnProperty("heading") && aside.dataset.heading.search(/p\d+/) > -1) {
			aside.dataset.heading = replacePersonReference(aside.dataset.heading);
		}
	});
});

// identifying the people needs to come after the document finishes loading
S.queue.add({  // This can't be S.onLoad since replacing the person references eliminates any listeners (due to replacing the HTML). ////
	runOrder: "first",
	function: identifyPeople
});
