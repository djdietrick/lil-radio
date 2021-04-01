pub mod sweep;
pub mod db;
mod models;
extern crate wasm_bindgen;

use sweep::sweep;
use db::create_connection;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn sweep_directory(db_file: &str,dir: &str) {
    let conn = create_connection(db_file).unwrap();

    sweep(&conn, dir).unwrap();
}