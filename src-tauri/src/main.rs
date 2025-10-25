// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod elevenlabs;
mod models;

use dotenvy;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    elevenlabs_vista_lib::run()
}
