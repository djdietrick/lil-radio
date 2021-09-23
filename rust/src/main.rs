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
        if dir.len() > 0 {
            sweep::sweep(&conn, dir).unwrap();
        }
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{Duration, Instant};

    #[test]
    fn big_dir_time_test() {
        let db_file = "./test.db";
        let conn = db::create_connection(db_file).unwrap();
        //let big_dir = "F:/Music";
        let big_dir = "D:/Dropbox/Music/Artists";

        let start = Instant::now();
        sweep::sweep(&conn, big_dir).unwrap();
        let duration = start.elapsed().as_secs();

        println!("Time elapsed in seconds: {}", duration);
        println!("Time elapsed in minutes: {}", duration / 60);
        assert_eq!(2,1);
    }
}
