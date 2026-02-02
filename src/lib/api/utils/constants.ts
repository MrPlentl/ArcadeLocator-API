export const PERMISSIONS = Object.freeze({
	CREATE: "create",
	READ: "read",
	UPDATE: "update",
	DELETE: "delete",
	// Table access
	ADMIN: {
		VALIDATE: "admin_validate",
	},
	GAME: {
		CREATE: "game_create",
		READ: "game_read",
		UPDATE: "game_update",
		DELETE: "game_delete",
	},
	MOVIE: {
		CREATE: "movie_create",
		READ: "movie_read",
		UPDATE: "movie_update",
		DELETE: "movie_delete",
	},
	SHOW: {
		CREATE: "show_create",
		READ: "show_read",
		UPDATE: "show_update",
		DELETE: "show_delete",
	},
});
