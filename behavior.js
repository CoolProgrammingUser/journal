var S = Standards.general;
// doesn't require Standards.storage except for optional bookmarking
if (Standards.storage) {
	// sets a slightly more specific default storage location just in case I forget to specify one when I should
	Standards.storage.session.defaultLocation = "/journal/";
	Standards.storage.local.defaultLocation = "/journal/";
	Standards.storage.server.defaultLocation = "/journal/";
}

if (typeof people == "undefined") {
	var people = [];
}
if (typeof topics == "undefined") {
	var topics = [];
}



function describeHonesty(element) {
	if (element.title != "") {
		element.title += "\n";
	}
	let indication = element.className.match(/(?:^| )(h(?:-\w)?\d)/)[1];
	if (indication.includes("-")) {
		element.title += "Honesty = " + indication.slice(2);
	} else {
		element.title += "Honesty = " + indication[1];
	}
	switch (indication) {
		case "h1":
			element.title += " (Fanciful)";
			break;
		case "h2":
			element.title += " (Suggestive)";
			break;
		case "h3":
			element.title += " (Honest)";
			break;
		case "h4":
			element.title += " (Sincere)";
			break;
		case "h-u1":
			element.title += " (Mildly understated)";
			break;
		case "h-u2":
			element.title += " (Moderately understated)";
			break;
		case "h-u3":
			element.title += " (Greatly understated)";
			break;
		case "h-o1":
			element.title += " (Mildly overstated)";
			break;
		case "h-o2":
			element.title += " (Moderately overstated)";
			break;
		case "h-o3":
			element.title += " (Greatly overstated)";
			break;
	}
}

function assignTone(items) {
	/**
	gives titles to mood and honesty indications
	*/
	let emotions = [  // contentment, energy, name  (or designation, name)
		{ c: ["1"], e: ["1"], n: "Despairing" },  // devastated, desperate, overwhelmed, ashamed, hopeless, dejected, disconsolate, despondent
		{ c: ["1"], e: ["2"], n: "Hopeless" },
		{ c: ["1"], e: ["4"], n: "Loathing" },
		{ c: ["1"], e: ["5"], n: "Seething" },
		{ c: ["1"], e: ["6"], n: "Fuming" },
		{ c: ["1"], e: ["7"], n: "Furious" },
		{ c: ["2"], e: ["1", "2"], n: "Sad" },
		{ c: ["2"], e: ["4", "5"], n: "Irritated" },
		{ c: ["2"], e: ["6", "7"], n: "Angry" },
		{ c: ["3"], e: ["4", "5"], n: "Annoyed" },
		{ c: ["3"], e: ["6", "7"], n: "Frustrated" },
		{ c: ["3", "4", "5"], e: ["1", "2"], n: "Exhausted" },
		{ c: ["4"], e: ["3", "4", "5"], n: "Unfeeling" },
		{ c: ["5"], e: ["4", "5", "6"], n: "Content" },
		{ c: ["6"], e: ["5", "6", "7"], n: "Happy" },
		{ c: ["6", "7"], e: ["1", "2"], n: "Relieved" },
		{ c: ["6", "7"], e: ["4"], n: "Amused" },
		{ c: ["7"], e: ["5", "6"], n: "Joyful" },
		{ c: ["7"], e: ["7"], n: "Ecstatic" },
		{ d: "a1", n: "Worried" },
		{ d: "a2", n: "Anxious" },
		{ d: "a3", n: "Terrified" },
		{ d: "m1", n: "Slightly mischevious" },
		{ d: "m2", n: "Moderately mischevious" },
		{ d: "m3", n: "Highly mischevious" },
		{ d: "u1", n: "Sympathetic" },
		{ d: "u2", n: "Embarrassed" },
		{ d: "u3", n: "Awkward" },
		{ d: "i1", n: "Bored" },
		{ d: "i2", n: "Intrigued" },
		{ d: "i3", n: "Fascinated" },
		{ d: "o1", n: "Regretful" },
		{ d: "o2", n: "Cynical" },
		{ d: "o3", n: "Resolute" }
	];
	//// aspects of emotion = contentment, energy, control, expectation, appreciation

	let iterator;
	if (items) {
		switch (S.getType(items)) {
			case "String":
				iterator = [document.getElementById(items)];
				break;
			case "HTMLElement":
				iterator = [items];
				break;
			case "Array":
			case "HTMLCollection":
				iterator = items;
				break;
			default:
				throw new TypeError('The "items" to set the tone of were the incorrect type.');
		}
	} else {
		iterator = document.body.querySelectorAll("*[class]");  // every element with a class
	}
	S.forEach(iterator, function (element) {
		if (element.parentNode && element.parentNode.title != "" && element.title == "") {
			element.title = element.parentNode.title;
		}
		if (element.className.search(/(?:^| )(e(?:-\w)?\d+)/) > -1) {  // if the element has an emotion indication
			if (element.title != "") {
				element.title += "\n";
			}
			let indication = element.className.match(/(?:^| )(e(?:-\w)?\d+)/)[1];
			if (indication.includes("-")) {
				element.title += "Emotion = " + indication.slice(2);
			} else {
				element.title += "Emotion = " + indication[1] + "," + indication[2];
			}
			if (indication.includes("-")) {
				emotions.forEach(function (set) {
					if (set.d == indication.slice(2)) {
						element.title += " (" + set.n + ")";
					}
				});
			} else {
				emotions.forEach(function (set) {
					if (!set.d) {
						if (set.c.includes(indication[1]) && set.e.includes(indication[2])) {
							element.title += " (" + set.n + ")";
						}
					}
				});
			}
			if (element.className.search(/(?:^| )(h(?:-\w)?\d)/) > -1) {  // if the element has an honesty indication as well
				describeHonesty(element);
			}
		} else if (element.className.search(/(?:^| )(h(?:-\w)?\d)/) > -1) {  // if the element has an honesty indication
			describeHonesty(element);
		}

		// allows the display of "titles" on mobile devices
		if (element.title) {
			if (element.className.search(/(?:^|\W)p\d/) > -1) {
				S.listen(element, "touchhold", function () {
					S.makeDialog(element.title.replace("\n", "<br>") + "<br><br>Search this person in a new tab?",
						["Yes", element.click],
						"No"
					);
				}, { allowDefault: true });
			} else {
				S.listen(element, "touchhold", function () {
					S.makeDialog(element.title.replace("\n", "<br>"), "Done");
				}, { allowDefault: true });
			}
		}
	});
}

function findEntry(element) {
	/**
	Finds the entry containing the element
	*/
	if (S.getType(element) != "HTMLElement") {
		throw "An HTML element must be provided to find its containing entry.";
	}
	/*
	while (element && !element.className.includes("entry")) {
		element = element.parentNode;
	}
	*/
	element = element.closest(".entry");
	if (element) {  // if the entry was found
		return element;
	} else {
		console.error("The entry containing the entry couldn't be found.");
		return;
	}
}



function enableSpecialBehavior() {

	//// setting people references used to be here

	// enables making use of elaborations
	//// (Standards.general doesn't work because listeners are erased while creating person links)
	Standards.general.forEach(document.getElementsByTagName("aside"), function (section) {
		if (!section.dataset.hasOwnProperty("heading")) {
			section.dataset.heading = "Elaboration";
		}
		if (section.textContent.trim() == "") {  // if I forgot to fill the aside
			section.textContent = "Oops, I forgot to fill this.";
		}
		let button = document.createElement("button");
		button.className = "hide-aside";
		button.addEventListener("click", function () {
			let classes = section.className.split(" ");
			classes.splice(classes.indexOf("displayed"), 1);
			section.className = classes.join(" ");
		});
		section.appendChild(button);
	});
	Standards.general.forEach(document.getElementsByClassName("elaborate"), function (trigger) {
		trigger.addEventListener("click", function () {
			let aside = trigger;
			while (aside.nextSibling && aside.tagName != "ASIDE") {
				aside = aside.nextSibling;
			}
			if (aside.tagName != "ASIDE" && aside.parentNode) {
				aside = aside.parentNode;
				while (aside.nextSibling && aside.tagName != "ASIDE") {
					aside = aside.nextSibling;
				}
			}
			if (aside.tagName == "ASIDE") {
				aside.className += " displayed";
			}
		});
	});
}

S.queue.add({  // This can't be S.onLoad since replacing the person references eliminates any listeners (due to replacing the HTML).  //// update
	runOrder: "first",
	function: function () {
		//// enableSpecialBehavior();
	}
});
S.queue.add({
	runOrder: "later",
	function: function () {
		setTimeout(assignTone, 0);  // assigns the tones  //// I don't know why this needs to be in a timeout if it's already being run later.
		/// This needs to be separate from the other code because it has to break out of that code block.
		/// The HTML of the page doesn't update until the script finishes executing,
		//- so the HTML modifications for the people references eliminate any listeners
		//- created before the end of this code block.
	}
});

S.onLoad(function () {
	if (S.getTag("main")[0].className.includes("bookmark-padding")) {  // if the page should have bookmarks
		let bookmarkNumber = 1;
		function addBookmark(mark, shouldSave) {
			if (S.getType(mark) == "Number") {  // if only the location of the bookmark was provided
				mark = {
					number: bookmarkNumber,
					text: "Place " + bookmarkNumber++,
					location: mark,
					color: "yellow"
				};
			}
			let bookmark = document.createElement("div");
			bookmark.className = "bookmark";
			bookmark.id = "bookmark" + mark.number;
			bookmark.textContent = mark.text;
			bookmark.style.top = mark.location + "px";
			S.getId("bookmarksBar").appendChild(bookmark);
			if (shouldSave) {
				let list = Standards.storage.local.recall("bookmarks");
				list.push(mark);
				Standards.storage.local.store("bookmarks", list);
			}
			S.listen(bookmark, "click", function (e) {
				e.stopPropagation();  // prevents the bookmarksBar listener from being triggered
				S.makeDialog("Select an action.", {
					"Edit bookmark": function () {
						S.makeDialog('Title<br><input type="text"" value="' + bookmark.textContent + '">', {
							"Done": function () {
								let newText = S.getClass("dialog")[0].getElementsByTagName("input")[0].value.trim();
								if (newText !== "") {
									bookmark.textContent = newText;
									let list = Standards.storage.local.recall("bookmarks");
									mark.text = newText;
									list.splice(list.findIndex(function (i) { return i.number == mark.number; }), 1, mark);
									Standards.storage.local.store("bookmarks", list);
								}
							}
						});
					},
					"Remove bookmark": function () {
						S.removeSelf(bookmark);
						let list = Standards.storage.local.recall("bookmarks");
						list.splice(list.findIndex(function (i) { return i.number == mark.number; }), 1);
						Standards.storage.local.store("bookmarks", list);
					},
					"Cancel": function () {}
				});
			});
		}

		if (S.getType(Standards.storage.local.recall("bookmarks")) == "Error") {  // if the page hasn't been loaded before (with bookmarking)
			Standards.storage.local.store("bookmarks", []);
			/// the default location should be set per page
		} else {
			let bookmarks = Standards.storage.local.recall("bookmarks");
			/*
			bookmarks = [
				{
					number: 1,
					text: "Bookmark text",
					location: 1234,
					color: "yellow"
				}
			]
			*/
			S.forEach(bookmarks, function (bookmark) {
				// makes sure the bookmark number is higher than the highest bookmark number
				// (prevents ID conflicts)
				if (bookmark.number >= bookmarkNumber) {
					bookmarkNumber = bookmark.number + 1;
				}
				addBookmark(bookmark);
			});
		}

		function viewBookmarks() {
			let bookmarks = Standards.storage.local.recall("bookmarks");
			if (bookmarks.length > 0) {
				let list = document.createElement("ul");
				list.innerHTML = "<li><a target='_self' href='#'>Top of page</a></li>";
				bookmarks.sort(function (a, b) { return a.location - b.location; });
				S.forEach(bookmarks, function (bookmark) {
					let li = document.createElement("li");
					let a = document.createElement("a");
					a.href = "#bookmark" + bookmark.number;
					a.target = "_self";
					a.textContent = bookmark.text;
					li.appendChild(a);
					list.appendChild(li);
				});
				S.makeDialog(list);
				list.addEventListener("click", function () {
					this.parentElement.parentElement.getElementsByTagName("button")[0].click();  // makes sure the dialog disappears when a link is clicked
				});
			} else {
				S.makeDialog("This page doesn't contain any bookmarks saved to your device. Click the side bar to add some.");
			}
		}
		S.listen("viewBookmarks", "click", function (e) {
			e.stopPropagation();  // prevents the bookmarksBar listener from being triggered
			viewBookmarks();
		});
		S.listen("bookmarksBar", "click", function (event) {
			S.makeDialog("Select an action.", {
				"View bookmarks": viewBookmarks,
				"Add a bookmark": function () {
					let bookmarkHeight = window.getComputedStyle(document.documentElement).getPropertyValue("--bookmarks-bar-width");
					bookmarkHeight = Math.round(Number(bookmarkHeight.match(/\d+/)[0]) * parseFloat(getComputedStyle(document.documentElement).fontSize));
					addBookmark(event.clientY - S.getId("bookmarksBar").getBoundingClientRect().top - bookmarkHeight / 2, true);
				},
				"Help": function () {
					S.makeDialog(
						"Clicking on this side bar to the left of the content will give you the option to place a bookmark at the location of your click. " +
						"Alternatively, selecting the button to view bookmarks will show you a list of your saved bookmarks. " +
						"If you add a bookmark, you'll be able to quickly find and navigate to that part of the page from the list of bookmarks. " +
						"However, take note that the bookmark will only be saved to the device you're currently using. " +
						"Linking bookmarks to an account is planned but not yet implemented. " +
						"Once you have a bookmark, you can click on it to edit or remove it."
					);
				},
				"Cancel": function () {}
			});
		});
	}
});
