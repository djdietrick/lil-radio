use rusqlite::{Connection, params};
use id3::Tag;
use mp3_duration;
use std::time::Duration;
use log::error;

use super::artist::Artist;
use super::album::Album;

pub struct Song {
    pub id: i64,
    pub title: String,
    pub artist_id: i64,
    pub album_id: i64,
    pub duration: u32,
    pub track: u32,
    pub disk: u32
}

impl Song {
    fn new(title: String, artist_id: i64, album_id: i64, duration: u32, track: u32, disk: u32) -> Song {
        Song {
            id: -1,
            title,
            artist_id,
            album_id,
            duration,
            track,
            disk
        }
    }

    pub fn build_from_path(db: &Connection, p: String) -> Option<Song> {
        match Tag::read_from_path(&p) {
            Err(_) => {
                return None;
            },
            Ok(tag) => {
                let mut artist_id: i64 = -1;
                let mut album_id: i64 = -1;

                if let Some(artist) = tag.artist() {
                    if let Some(artist_struct) = Artist::query_by_name(db, String::from(artist)) {
                        artist_id = artist_struct.id;
                    }
                    if artist_id < 0 {
                        let mut artist_struct = Artist::new(String::from(artist));
                        artist_struct.create_or_update(db);
                        artist_id = artist_struct.id;
                    }
                    assert!(artist_id >= 0, "Could not figure out artist {}", artist);
                } else {
                    error!("No artist found for song {}, skipping...", p);
                    return None;
                }
                if let Some(album) = tag.album() {
                    if let Some(album_struct) = Album::query_by_title_and_artist(db, String::from(album), artist_id) {
                        album_id = album_struct.id;
                    }
                    if album_id < 0 {
                        let mut album_struct = Album::new(String::from(album), artist_id);
                        album_struct.create_or_update(db);
                        album_id = album_struct.id;
                    }
                    assert!(album_id >= 0, "Could not figure out album {}", album);
                } else {
                    error!("No album found for song {}, skipping...", p);
                    return None;
                }

                if tag.title() == None {
                    error!("No title found for song {}, skipping...", p);
                    return None;
                }

                let track = tag.track().unwrap_or(1);
                let disk = tag.disc().unwrap_or(1);

                if let Some(song) = Song::full_query(db, String::from(tag.title().unwrap()), artist_id, album_id, track, disk) {
                    return Some(song);
                } else {
                    let duration = mp3_duration::from_path(&p).unwrap_or(Duration::new(0,0));

                    let mut song = Song::new(String::from(tag.title().unwrap()), 
                        artist_id, 
                        album_id, 
                        duration.as_secs() as u32, 
                        track, 
                        disk);

                    match song.create_or_update(db) {
                        Err(_) => None,
                        Ok(()) => Some(song)
                    }
                }
            }
        }
    }

    pub fn full_query(db: &Connection, title: String, artist_id: i64, album_id: i64, track: u32, disk: u32) -> Option<Song> {
        let mut stmt = db.prepare("SELECT id, title, artistId, albumId, duration, track, disk FROM song 
            WHERE title=$1 AND albumId=$2 AND artistId=$3 AND track=$4 and disk=$5").unwrap();
        let mut song_iter = stmt.query_map(params![title, artist_id, album_id, track, disk], |row| {
            Ok(Song {
                id: row.get(0)?,
                title: row.get(1)?,
                artist_id: row.get(2)?,
                album_id: row.get(3)?,
                duration: row.get(4)?,
                track: row.get(5)?,
                disk: row.get(6)?
            })
        }).unwrap();

        if let Some(song) = song_iter.next() {
            return Some(song.unwrap());
        } else {
            return None;
        }
    }

    pub fn create_or_update(&mut self, db: &Connection) -> Result<(),()> {
        if self.id < 0 {
            let v = db.execute("INSERT INTO song (title, artistId, albumId, duration, track, disk) VALUES
                (?1, ?2, ?3, ?4, ?5, ?6)", params![self.title, self.artist_id, self.album_id, self.duration, self.track, self.disk])
                .unwrap_or_else(|error| {
                    error!("Error inserting into db {}, {}, {}: {:?}", self.title, self.artist_id, self.album_id, error);
                    0
                });
            if v == 0 { return Err(()); }
            self.id = db.last_insert_rowid();
            Ok(())
        } else {
            db.execute("UPDATE song SET title=\"?1\", artistId=?2, albumId=?3, duration=?4, track=?5, disk=?6 WHERE id=?7",
                params![self.title, self.artist_id, self.album_id, self.duration, self.track, self.disk, self.id]).unwrap();
            Ok(())
        }
    }
}