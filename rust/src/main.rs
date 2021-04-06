mod db;
mod sweep;
mod models;
use std::env;
use env_logger;

fn main() -> Result<(), ()> {
    env_logger::init();

    let args: Vec<String> = env::args().collect();

    assert!(args.len() == 3, "Invalid args!");

    let db_file = &args[1];
    let dirs: Vec<&str> = args[2].split(';').collect();

    let conn = db::create_connection(db_file).unwrap();

    for dir in dirs {
        sweep::sweep(&conn, dir).unwrap();
    }

    Ok(())
}