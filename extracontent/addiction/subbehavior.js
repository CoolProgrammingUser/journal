S.onLoad(function () {
	if (S.getEnd(window.location.href.split("/")) != "index.html") {
		S.makeDialog("Are you sure that you want to read this? Once you read it, it can't be unread.",
			"Yes",
			["No", function () {
				window.location.href = ".";
			}]
		);
	}
});
