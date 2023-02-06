var S = Standards.general;
var server = Standards.storage.server;

var people = [];
var placeholders = [];



(function () {  // makes a separate event fire when all people have been loaded
	let listsToLoad = 2;
	let incrementProgress = function () {
		listsToLoad--;
		if (listsToLoad == 0) {
			console.log("Recalled people and placeholders");
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
			let text;
			if (location.dataset.use.indexOf("extra") == 0) { // if one of the extra names should be used
				text = person.extraNames[Number(location.dataset.use.match(/\d+/)[0]) - 1];
			} else {  // if one of the other designated names should be used
				text = person[location.dataset.use.match(/\w+/)[0]];
			}
			if (location.dataset.use.search(/\.(?:s|str|string)\./) > -1) {  // if the string should be modified
				location.dataset.use.match(/\.(?:s|str|string)((?:\.\w+(?:\([^)]*\))?)+)/)[1].slice(1).split(".").forEach(function (mod) {
					switch (mod.match(/^\w+/)[0]) {
						case "toUpperCase":
							text = text.toUpperCase();
							break;
						case "toSentenceCase":
							text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
							break;
						case "toLowerCase":
							text = text.toLowerCase();
							break;
						case "length":
							text = text.length;
							break;
						case "0":
							text = text.charAt(0);
							break;
						case "itemAt":
							if (mod.search(/\([^)]+\)/) > -1) {  // if there's something in parentheses
								text = S.itemAt(text, mod.match(/-?\d+/)[0]);
							}
							break;
						case "slice":
							if (mod.search(/\([^)]+\)/) > -1) {  // if there's something in parentheses
								if (mod.includes(",")) {
									text = text.slice(mod.match(/-?\d+/)[0], mod.match(/, ?(-?\d+)/)[1]);
								} else {
									text = text.slice(mod.match(/-?\d+/)[0]);
								}
							}
							break;
						case "match":
							if (mod.search(/\([^)]+\)/) > -1) {  // if there's something in parentheses
								if (mod.search(/\/.+\//) > -1) {  // if it has a regular expression
									if (mod.search(/\/.+\/\w+/) > -1) {  // if the regular expression has flags
										text = text.match(new RegExp(mod.match(/\/(.+)\//)[1], mod.match(/\/.+\/(\w+)/)[1]));
									} else {
										text = text.match(new RegExp(mod.match(/\/(.+)\//)[1]));
									}
								} else {
									text = text.match(mod.match(/\(([^)]+)\)/)[1]);
								}
							}
							break;
						case "split":
							if (mod.search(/\([^)]+\)/) > -1) {  // if there's something in parentheses
								text = text.split(mod.match(/\(([^)]+)\)/)[1]);
							}
							break;
					}
				});
			}
			link.textContent = text
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
	console.log("Starting to identify people");
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
		console.log("Waiting for people to load");
		let originalServerStorageLocation = Standards.storage.server.defaultLocation;
		server.defaultLocation = "^websites/journal/";  // needed to prevent checking for a user

		// loads the people
		server.recall("people", null, { requireSignIn: false }).then(function (list) {
			console.log("Recalled regular people");
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
			console.log("Recalled placeholders");
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
	console.log("Loaded all people");
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
