CREATE TABLE IF NOT EXISTS settings (
    name TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artist (
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX artist_name ON artist (name);

CREATE TABLE IF NOT EXISTS album (
    title TEXT NOT NULL,
    artistId INTEGER NOT NULL,
    FOREIGN KEY(artistId) REFERENCES artist(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX unique_album ON album (title, artistId);

CREATE TABLE IF NOT EXISTS song (
    title TEXT NOT NULL,
    artistId INTEGER NOT NULL,
    albumId INTEGER NOT NULL,
    duration INTEGER NOT NULL,
    track INTEGER NOT NULL,
    'disk' INTEGER DEFAULT 1,
    FOREIGN KEY(artistId) REFERENCES artist(id) ON DELETE CASCADE,
    FOREIGN KEY(albumId) REFERENCES album(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX unique_song ON song (title, artistId, albumId);

CREATE TABLE IF NOT EXISTS datatype (
    id INTEGER PRIMARY KEY,
    value TEXT NOT NULL UNIQUE
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS 'data' (
    'path' TEXT NOT NULL,
    datatypeId INTEGER,
    size INTEGER DEFAULT 0,
    FOREIGN KEY(datatypeId) REFERENCES datatype(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX data_path ON data ('path');

CREATE TABLE IF NOT EXISTS song_data (
    songId INTEGER NOT NULL UNIQUE,
    dataId INTEGER NOT NULL UNIQUE,
    FOREIGN KEY(songId) REFERENCES song(id) ON DELETE CASCADE,
    FOREIGN KEY(dataId) REFERENCES data(id) ON DELETE CASCADE
);

CREATE INDEX song_data_songId ON song_data (songId);

INSERT INTO settings (name, value) VALUES ('MUSIC_DIRS', 'D:\Dropbox\Music\Artists\Phish\2019_07_05 Boston, MA');