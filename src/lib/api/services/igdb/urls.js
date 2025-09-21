export function getIgdbAuthUrl(clientId, clientSecret) {
	return `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
}

export function getIgdbBaseUrl() {
	return "https://api.igdb.com/v4";
}
