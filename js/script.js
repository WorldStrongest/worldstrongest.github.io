$(document).ready(function(){
	team = 'worldstrongest';

	// twitch api
	live_channels       = 'http://api.twitch.tv/api/team/' + team + '/live_channels.json'
	offline_channels    = 'http://api.twitch.tv/api/team/' + team + '/offline_channels.json'
	current_live_stream = 'http://api.twitch.tv/api/team/' + team + '/current_live_stream.json'

	// set twitch's current_live_stream as the active user
	// change the flash to active user
	JSONP(current_live_stream, function(data) {
		activeUser = data.display_name;
		changeStream(activeUser);

		// generate footer with online and offline channels
		getUsers("#online");
		getUsers("#offline");
	});

	// when a user in the footer is clicked,
	// change the stream and active user to that user
	$('footer').click(function() {
		if (event.target.className == "dvChange") {
			$(".activeUser").removeClass("activeUser");
			changeStream(event.target.id);
			$("#" + event.target.id).addClass("activeUser");
		}
	});

});

/*
 * Change the stream to 'username' by adjusting the flash object attributes.
 * focus() is used to refresh the flash object.
 */
function changeStream(username) {
	activeUser = username;
	$('#flashvars').val("hostname=www.twitch.tv&auto_play=true&start_volume=25&channel="+username);
	$('#live_embed_player_flash').attr("data", "http://www.twitch.tv/widgets/live_embed_player.swf?channel=" + username);	
	$('#live_embed_player_flash').focus();

	$("#activeName").text(username);
};

/*
 * Fetches user from team's channel using id and append the twitch portrait of the users.
 * if id is #online, fetch from live_channels,
 * else if id is #offline, fetch from offline_channels (default).
 */
function getUsers(id) {
	if (id == "#online")       jsonUrl = live_channels;
	else if (id == "#offline") jsonUrl = offline_channels;
	else                       jsonUrl = offline_channels;
	
	JSONP(jsonUrl, function(data) {
		data.channels.forEach(function(entry) {
			name     = entry.channel.display_name;
			if (id == "#offline") imageUrl = entry.channel.image.size70;
			else imageUrl = entry.channel.image.size150;
			objClass = "dvChange";
			if (name == activeUser) objClass += " activeUser";

			$(id).append("<img src='" + imageUrl + "' class='" + objClass + "' id='" + name + "' title='" + name + "' href='#'' />");

		});
	});
}


/*
 * Usage:
 * 
 * JSONP( 'someUrl.php?param1=value1', function(data) {
 *   //do something with data, which is the JSON object retrieved from someUrl.php
 * });
 *
 * source: https://github.com/justintv/Twitch-API/issues/133
 */
var JSONP = (function(){ 'use strict';
	var counter = 0;

	var memoryleakcap = function() {
		if (this.readyState && this.readyState !== "loaded" && this.readyState !== "complete") { return; }

		try {
			this.onload = this.onreadystatechange = null;
			this.parentNode.removeChild(this);
		} catch(ignore) {}
	};

	return function(url, callback) {
		var uniqueName = 'callback_json' + (++counter);

		var script = document.createElement('script');
		script.src = url + (url.toString().indexOf('?') === -1 ? '?' : '&') + 'callback=' + uniqueName;
		script.async = true;

		window[ uniqueName ] = function(data){
			callback(data);
			window[ uniqueName ] = null;
			try { delete window[ uniqueName ]; } catch (ignore) {}
		};

		script.onload = script.onreadystatechange = memoryleakcap;

		document.getElementsByTagName('head')[0].appendChild( script );

		return uniqueName;
	};
}());