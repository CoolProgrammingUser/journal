var S = Standards.general;

if (typeof people == "undefined") {
	var people = [];
}
if (typeof topics == "undefined") {
	var topics = [];
}

S.onLoad(function () {

	// fills all of the empty person references with people
	let HTML = document.body.innerHTML;
	HTML = HTML.replace(/([^'"“])(p\d+)([^'"”])/g, function (match, leftCharacter, person, rightCharacter) {
		return leftCharacter + '<span class="' + person + '"></span>' + rightCharacter;
	});
	document.body.innerHTML = HTML;

	// makes all of the people references links
	S.forEach(people.slice(1), function (person, index) {
		S.forEach(S.getClass("p" + index), function (occurrence) {
			let link = document.createElement("a");
			link.className = "discreet";
			link.href = "/journal/search?p=" + index;  // "/journal/" is included just in case the link is put in a weird place
			link.target = "_blank";
			link.title = person.fullName;
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

	// enables making use of elaborations
	S.forEach(S.getTag("aside"), function (section) {
		if (!section.dataset.hasOwnProperty("heading")) {
			section.dataset.heading = "Elaboration";
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
	let emotions = [
		{ c: ["1"], e: ["1", "2"], n: "Devastated" },
		{ c: ["1", "2"], e: ["3", "4"], n: "Exhausted" },
		{ c: ["1"], e: ["7"], n: "Furious" },
		{ c: ["2"], e: ["1", "2"], n: "Sad" },
		{ c: ["2"], e: ["4", "5"], n: "Irritated" },
		{ c: ["2"], e: ["6", "7"], n: "Angry" },
		{ c: ["3"], e: ["4", "5"], n: "Annoyed" },
		{ c: ["3"], e: ["6", "7"], n: "Frustrated" },
		{ c: ["4"], e: ["3", "4", "5"], n: "Unfeeling" },
		{ c: ["5"], e: ["4", "5", "6"], n: "Content" },
		{ c: ["6"], e: ["5", "6", "7"], n: "Happy" },
		{ c: ["6", "7"], e: ["1", "2"], n: "Relieved" },
		{ c: ["7"], e: ["7"], n: "Ecstatic" },
		{ c: ["-"], e: ["1"], n: "Worried" },
		{ c: ["-"], e: ["2"], n: "Anxious" },
		{ c: ["-"], e: ["3"], n: "Terrified" }
	];
	S.forEach(document.body.querySelectorAll("*"), function (element) {
		if (element.className.search(/(?:^| )e-?\d+/) > -1) {  // if the element has an emotion indication
			if (!element.title == "") {
				element.title += "\n";
			}
			let indication = element.className.match(/(?:^| )(e-?\d+)/)[1];
			if (indication.includes("-")) {
				element.title += "Emotion = " + indication.slice(1);
			} else {
				element.title += "Emotion = " + indication[1] + "," + indication[2];
			}
			emotions.forEach(function (set) {
				if (set.c.includes(indication[1]) && set.e.includes(indication[2])) {
					element.title += " (" + set.n + ")";
				}
			});
			if (element.className.search(/(?:^| )h\d/) > -1) {
				element.title += "\nHonesty = " + element.className.match(/(?:^| )h(\d)/)[1];
			}
		} else if (element.className.search(/(?:^| )h\d/) > -1) {
			if (!element.title == "") {
				element.title += "\n";
			}
			element.title += "Honesty = " + element.className.match(/(?:^| )h(\d)/)[1];
		}
	});
});
