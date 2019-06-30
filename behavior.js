var S = Standards.general;

if (typeof people == "undefined") {
	var people = [];
}
if (typeof topics == "undefined") {
	var topics = [];
}

S.queue.add({  // This can't be S.onLoad since replacing the person references eliminates any listeners (due to replacing the HTML).
	runOrder: "first",
	function: function () {

		// fills all of the empty person references with people
		let HTML = document.body.innerHTML;
		HTML = HTML.replace(/([^'"“])(p\d+)([^"”])/g, function (match, leftCharacter, person, rightCharacter) {
			return leftCharacter + '<span class="' + person + '"></span>' + rightCharacter;
		});
		document.body.innerHTML = HTML;

		// makes all of the people references links
		S.forEach(people.slice(1), function (person, index) {
			S.forEach(S.getClass("p" + (index+1)), function (occurrence) {
				let link = document.createElement("a");
				link.className = "discreet";
				link.href = "/journal/search?p=" + (index+1);  // "/journal/" is included just in case the link is put in a weird place
				//// link.target = "_blank";  // This might not be necessary.
				link.title = person.firstName + (person.lastName ? " "+person.lastName : "");
				if (occurrence.textContent.trim() != "") {
					link.textContent = occurrence.textContent;
					occurrence.textContent = "";
				} else if (occurrence.dataset.use) {
					if (occurrence.dataset.use.includes("extra")) {
						link.textContent = person.extraNames[Number(occurrence.dataset.use.match(/\d+/)) - 1];  //// match[0]?
					} else {
						link.textContent = person[occurrence.dataset.use];
					}
				} else {
					link.textContent = person.name;
				}
				occurrence.appendChild(link);
			});
		});

		// handles special uses of p0 references
		// (useful for associating people who are potentially the same)
		S.forEach(S.getClass("p0"), function (occurrence) {
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

		// enables making use of elaborations
		S.forEach(S.getTag("aside"), function (section) {
			if (!section.dataset.hasOwnProperty("heading")) {
				section.dataset.heading = "Elaboration";
			}
			if (section.textContent.trim() == "") {  // if I forgot to fill the aside
				section.textContent = "Oops, I forgot to fill this.";
			}
			let button = document.createElement("button");
			button.className = "hide-aside";
			button.textContent = "[Hide]";
			button.addEventListener("click", function () {
				section.style.left = "100%";
			});
			section.appendChild(button);
		});
		S.forEach(S.getClass("elaborate"), function (trigger) {
			trigger.addEventListener("click", function () {
				trigger.nextSibling.style.left = "60%";
			});
		});

		// gives titles to mood and honesty indications
		let emotions = [  // contentment, energy, name  (or designation, name)
			{ c: ["1"], e: ["1", "2"], n: "Despairing" },  // devastated, desperate, overwhelmed, ashamed, hopeless, dejected, disconsolate, despondent
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
			{ c: ["7"], e: ["7"], n: "Ecstatic" },
			{ d: "a1", n: "Worried" },
			{ d: "a2", n: "Anxious" },
			{ d: "a3", n: "Terrified" },
			{ d: "m1", n: "Slightly mischevious" },
			{ d: "m2", n: "Moderately mischevious" },
			{ d: "m3", n: "Highly mischevious" },
			{ d: "u1", n: "Embarrassed" },
			{ d: "u2", n: "Awkward" },
			{ d: "u3", n: "Sympathetic" },
			{ d: "i1", n: "Bored" },
			{ d: "i2", n: "Intrigued" },
			{ d: "i3", n: "Fascinated" },
			{ d: "o1", n: "Regretful" }
		];
		//// aspects of emotion = contentment, energy, control, expectation

		S.forEach(document.body.querySelectorAll("*[class]"), function (element) {  // for every element with a class
			if (element.parentNode.title != "" && element.title == "") {
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
				if (element.className.search(/(?:^| )(h(?:-\w)?\d)/) > -1) {
					indication = element.className.match(/(?:^| )(h(?:-\w)?\d)/)[1];
					if (indication.includes("-")) {
						element.title += "\nHonesty = " + indication.slice(2);
					} else {
						element.title += "\nHonesty = " + indication[1];
					}
					switch (indication) {
						case "h1":
							element.title += " (Fanciful)";
							break;
						case "h2":
							element.title += " (Suggestive)";
							break;
						case "h3":
							element.title += " (Subtle)";
							break;
						case "h4":
							element.title += " (Honest)";
							break;
						case "h5":
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
			} else if (element.className.search(/(?:^| )(h(?:-\w)?\d)/) > -1) {
				if (!element.title == "") {
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
						element.title += " (Subtle)";
						break;
					case "h4":
						element.title += " (Honest)";
						break;
					case "h5":
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
		});
	}
});
