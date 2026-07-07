// Control token that frames the trailing game-state snapshot on the response
// stream. Chosen so it never collides with narrative prose. Shared by the
// server (stream writer) and the client (stream reader).
export const SNAPSHOT_DELIMITER = '\n\u241E\u241ESNAPSHOT\u241E\u241E\n'
