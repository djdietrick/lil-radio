use rusqlite::{Connection, Statement, params};
use std::fs::metadata;

#[derive(Debug, PartialEq)]
pub enum DataType {
    DIR,
    FILE
}

#[derive(Debug)]
pub struct Data {
    pub id: i64,
    pub path: String,
    pub datatype: DataType,
    pub size: u32
}

impl Data {
    pub fn build_from_path(p: &String) -> Data {
        let md = metadata(&p).unwrap();

        Data {
            id: -1,
            path: String::from(p),
            datatype: match md.is_dir() {
                true => DataType::DIR,
                false => DataType::FILE
            },
            size: match md.is_dir() {
                true => 0,
                false => md.len() as u32
            }
        }
    }

    pub fn query_by_path(db: &Connection, path: &String) -> Option<Data> {
        let mut stmt: Statement = db.prepare("SELECT id, path, datatypeId, size FROM data WHERE path=?1;").unwrap();
        //let mut data_iter = stmt.query_map_named(&[(":path", &path)], |row| {
        let mut data_iter = stmt.query_map(params![path], |row| {
            Ok(Data {
                id: row.get(0)?,
                path: row.get(1)?,
                datatype: match row.get(2)? {
                    0 => DataType::DIR,
                    1 => DataType::FILE,
                    _ => panic!("Unknown datatype!")
                },
                size: row.get(3)?
            })
        }).unwrap();

        if let Some(data) = data_iter.next() {
            return Some(data.unwrap());
        } else {
            return None;
        }
    }

    pub fn get_data_type_index(data: &Data) -> i8 {
        if data.datatype == DataType::DIR {
            return 0;
        } else {
            return 1;
        }
    }

    pub fn create_or_update(&mut self, db: &Connection) {
        if self.id < 0 {
            db.execute("INSERT INTO data (path, datatypeId, size) VALUES (?1, ?2, ?3);",
                params![self.path, Data::get_data_type_index(&self), self.size]).unwrap();
            self.id = db.last_insert_rowid();
        } else {
            db.execute("UPDATE data SET path=\"?1\", datatypeId=?2, size=?3 WHERE id=?4;",
                params![self.path, Data::get_data_type_index(&self), self.size, self.id]).unwrap();
        }
    }

    pub fn update_size(&mut self, db: &Connection, size: u32) {
        self.size = size;
        self.create_or_update(db);
    }

   
}