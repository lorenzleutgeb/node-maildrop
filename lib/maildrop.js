/* $base = /api
 *
 * GET        $base/suggestion      -> ((suggestion, err))
 * GET        $base/blocked         -> ((blocked, err))
 * GET        $base/inbox/:name     -> (name, ()
 * GET|DELETE $base/inbox/:name/:id ->
 */

var url  = require('url');
var http = require('https');

var endpoint = 'https://maildrop.cc/api'

function craft(suffix) {
	return endpoint + '/' + suffix;
}

function wrap(method, endpoint, callback) {
	var options = url.parse(endpoint);
	options.method = method;
	var req = http.request(options, function (res) {
		var data = '';
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function() {
			if (res.statusCode != 200) {
				callback('Invalid HTTP status code ' + res.statusCode + ' for ' + endpoint);
			} else {
				try {
					callback(undefined, JSON.parse(data.toString()))
				}
				catch (e) {
					callback(e);
				}
			}

		});
	});
	req.end();
}

module.exports.suggestion = function (callback) {
	return wrap('get', craft('suggestion'), function (err, data) {
		if (err) return callback(err);

		callback(err, data.suggestion);
	});
};

module.exports.blocked = function (callback) {
	return wrap('get', craft('blocked'), function (err, data) {
		if (err) return callback(err);

		callback(err, +data.blocked);
	});
};

module.exports.fetch = function (user, id, callback) {
	return wrap('get', craft('inbox/' + user + (id ? '/' + id : '')), callback);
};

module.exports.delete = function (user, id, callback) {
	return wrap('delete', craft('inbox/' + user + '/' + id), callback);
};
