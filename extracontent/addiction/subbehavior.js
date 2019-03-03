S.onLoad(function () {
	let url = new URL(window.location.href);
	console.log(url);
	console.log(S.getEnd(url.href.split("/")));
	if (S.getEnd(url.href.split("/")) != "index.html" && S.getEnd(url.href.split("/")) != "") {
		S.makeDialog("Are you sure that you want to read this? Once you read it, it can't be unread.",
			"Yes",
			["No", function () {
				window.location.href = ".";
			}]
		);
	}
});
