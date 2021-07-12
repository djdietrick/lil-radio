use rusqlite::{Connection, Result, Error, Rows, params};
use rusqlite::NO_PARAMS;
use fallible_streaming_iterator::FallibleStreamingIterator;
use log::{error};

pub fn create_connection(db_file: &str) -> Result<Connection, Error> {
    //let mut conn = Connection::open("db/test.db")?;
    
    let conn = Connection::open(db_file)?;

    migrate_database(&conn).unwrap_or_else(|error| {
        error!("Error while migrating database: {}", error);
    });

    Ok(conn)
}

fn migrate_database(conn: &Connection) -> Result<(), Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS settings (
            name TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL
        );", NO_PARAMS)?;

    conn.execute("
        CREATE TABLE IF NOT EXISTS artist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );", NO_PARAMS)?;

    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS artist_name ON artist (name);", NO_PARAMS)?;

    conn.execute("CREATE TABLE IF NOT EXISTS album (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artistId INTEGER NOT NULL,
        FOREIGN KEY(artistId) REFERENCES artist(id) ON DELETE CASCADE
    );", NO_PARAMS)?;

    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS unique_album ON album (title, artistId);", NO_PARAMS)?;

    conn.execute("CREATE TABLE IF NOT EXISTS song (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artistId INTEGER NOT NULL,
        albumId INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        track INTEGER NOT NULL,
        disk INTEGER DEFAULT 1,
        FOREIGN KEY(artistId) REFERENCES artist(id) ON DELETE CASCADE,
        FOREIGN KEY(albumId) REFERENCES album(id) ON DELETE CASCADE
    );", NO_PARAMS)?;

    //conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS unique_song ON song (title, artistId, albumId);", NO_PARAMS)?;

    conn.execute("CREATE TABLE IF NOT EXISTS datatype (
        id INTEGER PRIMARY KEY,
        value TEXT NOT NULL UNIQUE
    ) WITHOUT ROWID;", NO_PARAMS)?;

    conn.execute("CREATE TABLE IF NOT EXISTS data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        datatypeId INTEGER,
        size INTEGER DEFAULT 0,
        FOREIGN KEY(datatypeId) REFERENCES datatype(id) ON DELETE CASCADE
    );", NO_PARAMS)?;

    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS data_path ON data (path);", NO_PARAMS)?;

    conn.execute("CREATE TABLE IF NOT EXISTS song_data (
        songId INTEGER NOT NULL UNIQUE,
        dataId INTEGER NOT NULL UNIQUE,
        FOREIGN KEY(songId) REFERENCES song(id) ON DELETE CASCADE,
        FOREIGN KEY(dataId) REFERENCES data(id) ON DELETE CASCADE
    );", NO_PARAMS)?;

    conn.execute("CREATE INDEX IF NOT EXISTS song_data_songId ON song_data (songId);", NO_PARAMS)?;

    let mut stmt = conn.prepare("SELECT id, value FROM datatype;")?;
    let rows: Rows = stmt.query(NO_PARAMS)?;

    let size = rows.count().unwrap();
    if size != 2 {
        conn.execute("INSERT INTO datatype (id, value) VALUES (?1, ?2);", 
            params![0, "DIR"])?;
        conn.execute("INSERT INTO datatype (id, value) VALUES (?1, ?2);", 
            params![1, "FILE"])?;
    }

    conn.execute("CREATE TABLE IF NOT EXISTS station (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE);", NO_PARAMS)?;

    // conn.execute("CREATE TABLE IF NOT EXISTS chunk (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     stationId INTEGER NOT NULL,
    //     FOREIGN KEY(stationId) REFERENCES station(id) ON DELETE CASCADE
    // );", NO_PARAMS)?;

    // conn.execute("CREATE TABLE IF NOT EXISTS chunk_song (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     chunkId INTEGER NOT NULL,
    //     songId INTEGER NOT NULL,
    //     ind INTEGER NOT NULL,
    //     FOREIGN KEY(chunkId) REFERENCES chunk(id) ON DELETE CASCADE,
    //     FOREIGN KEY(songId) REFERENCES song(id) ON DELETE CASCADE
    // );", NO_PARAMS)?;

    conn.execute("CREATE TABLE IF NOT EXISTS station_song (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stationId INTEGER NOT NULL,
        songId INTEGER NOT NULL,
        FOREIGN KEY(stationId) REFERENCES station(id) ON DELETE CASCADE,
        FOREIGN KEY(songId) REFERENCES song(id) ON DELETE CASCADE,
        UNIQUE(stationId, songId)
    );", NO_PARAMS)?;
    
    Ok(())
}