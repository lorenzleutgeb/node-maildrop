#!/usr/bin/env node

var maildrop = require('../lib/maildrop');
var argv = process.argv;

argv.shift();
argv.shift();

function repeat(value, n) {
	var result = '';

	for (var i = 0; i < n; i++)
		result += value;

	return result;
}

function padRight(value, n) {
	return value + repeat(' ', n - value.length);
}

function padLeft(value, n) {
	return repeat(' ', n - value.length) + value;
}

function cutRight(value, n) {
	return value.length > n ? value.substring(0, n - 1) + '…' : value;
}

function fit(value, n) {
	return padRight(cutRight(value, n), n);
}

function fitAll(values, digits, senderLength, subjectLength) {
	return [
		padLeft(values[0], digits),
		values[1],
		fit(values[2], senderLength),
		fit(values[3], subjectLength),
		values[4]
	].join(' ');
}

if (argv[0] === 'suggest') {
	maildrop.suggestion(function (err, suggestion) {
		if (err) return console.error(err);
		console.log(suggestion);
	});
} else if (argv[0] === 'blocked') {
	maildrop.blocked(function (err, blocked) {
		if (err) return console.error(err);
		console.log(blocked);
	});
} else if (argv[0] === 'fetch') {
	if (argv.length < 2) {
		var help = '' +
'	fetch <name>\n' +
'		Fetch a list of messages in the specified inbox.\n' +
'	fetch <name> <id>\n' +
'		Fetch a specific message from an inbox.\n' +
'		IDs can be obtained from the list of messages.\n' +
'	fetch <name> <index>\n' +
'		Fetch some message specified by an index.';

		console.log(help);
		return;
	}

	var index = +argv[2] - 1;
	if (!isNaN(index)) {
		argv[2] = undefined;
	}

	maildrop.fetch(argv[1], argv[2], function (err, data) {
		if (argv[2]) {
			console.log(data.body);
		} else {
			if (!data.length) return;

			if (!isNaN(index)) {
				maildrop.fetch(argv[1], data[index].id, function (err, res, data) {
					console.log(data.body);
				});
			} else {
				var digits = (data.length + '').length;
				var cols = (process.stdout.columns - (digits + 6 + 24 + 4)) / 2;

				var subjectLength = Math.floor(cols);
				var senderLength = Math.ceil(cols);

				console.log(fitAll([ '#', 'ID', 'From', 'Subject', 'Date' ], digits, senderLength, subjectLength));
				data.map(function (it, index) {
					console.log(fitAll([ index + 1, it.id, it.sender, it.subject, new Date(it.date).toISOString() ], digits, senderLength, subjectLength));
				});
			}
		}

	});
} else {
	var help = '' +
	'	suggest		Suggests a name to use for your mailbox.\n' +
	'	blocked		Query the number of blocked messages.\n' +
	'	fetch		Obtain messages in a specific mailbox.';

	console.log(help);
}
