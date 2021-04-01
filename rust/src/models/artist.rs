use rusqlite::{Connection, params, Statement};

pub struct Artist {
    pub id: i64,
    pub name: String
}

impl Artist {
    pub fn new(name: String) -> Artist {
        Artist {
            id: -1,
            name: name
        }
    }

    pub fn query_by_name(db: &Connection, name: String) -> Option<Artist> {
        let mut stmt: Statement = db.prepare("SELECT id, name FROM artist WHERE name=?1").unwrap();
        let mut artist_iter = stmt.query_map(params![name], |row| {
            Ok(Artist {
                id: row.get(0)?,
                name: row.get(1)?
            })
        }).unwrap();

        if let Some(artist) = artist_iter.next() {
            return Some(artist.unwrap());
        } else {
            return None;
        }
    }

    pub fn create_or_update(&mut self, db: &Connection) {
        if self.id < 0 {
            db.execute("INSERT INTO artist (name) VALUES (?1)", params![self.name]).unwrap();
            self.id = db.last_insert_rowid();
        } else {
            db.execute("UPDATE artist SET name=\"?1\" WHERE id=?2", params![self.name, self.id]).unwrap();
        }
    }
}