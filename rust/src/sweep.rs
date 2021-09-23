use rusqlite::{Connection, Error, params};
use std::collections::HashMap;
use std::fs::{metadata, read_dir};
use std::path::Path;
use path_slash::PathExt;

use crate::models::data::{Data, DataType};
use crate::models::song::Song;
use log::{info, error, trace};

pub fn sweep(db: &Connection, path: &str) -> Result<(), Error> {
    let mut dir_sizes: HashMap<String, u64> = HashMap::new();

    find_size_rec(String::from(path), &mut dir_sizes, path).unwrap_or_else(|error| {
        error!("Problem finding size of directory {:?}: {:?}", path, error);
    });

    update_dir(db, String::from(path), &dir_sizes).unwrap_or_else(|error| {
        error!("Problem updating directories {:?}", error);
    });

    info!("Successfully swept {}", path);

    Ok(())
}

fn find_size_rec(dir: String, dir_sizes: &mut HashMap<String, u64>, start_dir: &str) -> Result<(),Box<Error>> {
    let md = metadata(&dir).unwrap();
    if md.is_dir() {
        dir_sizes.insert(String::from(&dir), 0);
        for entry in read_dir(dir).unwrap() {
            let path = entry.unwrap().path().to_slash().unwrap();
            find_size_rec(path, dir_sizes, start_dir)?;
        }
    } else {
        let size = md.len();
        let mut p = Path::new(&dir);
        while p.to_str().unwrap() != start_dir {
            p = p.parent().unwrap();
            *dir_sizes.entry(p.to_slash().unwrap()).or_insert(0) += size;
        }
    }

    Ok(())
}

fn update_dir(db: &Connection, path: String, dir_sizes: &HashMap<String, u64>) -> Result<(), Box<Error>> {
    if let Some(mut data) = Data::query_by_path(db, &path) {
        if data.datatype == DataType::DIR && data.size != *dir_sizes.get(&path).unwrap() as u32 {
            for entry in read_dir(&path).unwrap() {
                let child = entry.unwrap().path().to_slash().unwrap();
                update_dir(db, child, dir_sizes).unwrap();
            }
            data.update_size(db, *dir_sizes.get(&path).unwrap() as u32);
        }
    } else {
        let mut data: Data = Data::build_from_path(&path);
        if data.datatype == DataType::DIR {
            data.size = *dir_sizes.get(&path).unwrap() as u32;
            trace!("Created dir: {}", path);
            for entry in read_dir(path).unwrap() {
                let child = entry.unwrap().path().to_slash().unwrap();
                update_dir(db, child, dir_sizes).unwrap();
            }
            data.create_or_update(db);
        } else {
            trace!("Creating song: {}", path);
            data.create_or_update(db);
            if let Some(song) = Song::build_from_path(db, path) {
                create_song_data(db, song.id, data.id);
            }
        }
    }

    Ok(())
}

fn create_song_data(db: &Connection, song_id: i64, data_id: i64) {
    db.execute("INSERT INTO song_data (songId, dataId) VALUES (?1, ?2)", params![song_id, data_id]).unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn find_size_test() {
        let mut dir_sizes: HashMap<String, u64> = HashMap::new();
        let dir: &str = "D:/Dropbox/Music/Artists";
        find_size_rec(String::from(dir), &mut dir_sizes, dir).unwrap();
        print!("{:#?}", dir_sizes);
    }
    
}