use rusqlite::{Connection, params};
use log::error;

pub struct Album {
    pub id: i64,
    pub title: String,
    pub artist_id: i64
}

impl Album {
    pub fn new(title: String, artist_id: i64) -> Album {
        Album {
            id: -1,
            title: title,
            artist_id: artist_id
        }
    }

    pub fn query_by_title_and_artist(db: &Connection, title: String, artist_id: i64) -> Option<Album>{
        let mut stmt = db.prepare("SELECT id, title, artistId FROM album WHERE title=$1 AND artistId=$2").unwrap();
        let mut album_iter = stmt.query_map(params![title, artist_id], |row| {
            Ok(Album {
                id: row.get(0)?,
                title: row.get(1)?,
                artist_id: row.get(2)?
            })
        }).unwrap();

        if let Some(album) = album_iter.next() {
            return Some(album.unwrap());
        } else {
            return None;
        }
    }

    pub fn create_or_update(&mut self, db: &Connection) {
        if self.id < 0 {
            db.execute("INSERT INTO album (title, artistId) VALUES (?1, ?2)", params![self.title, self.artist_id]).unwrap_or_else(|error| {
                error!("Error creating album {}, {}: {:?}", self.title, self.artist_id, error);
                0
            });
            self.id = db.last_insert_rowid();
        } else {
            db.execute("UPDATE album SET title=?1, artistId=?2 WHERE id=?3", params![self.title, self.artist_id, self.id]).unwrap();
        }
    }
}