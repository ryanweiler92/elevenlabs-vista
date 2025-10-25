use crate::models;

use models::UserData;
use reqwest;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde_json::Value;
use std::fs::File;
use std::io::prelude::*;
use log::{info, warn, error, debug, trace};

const BASE_URL: &str = "https://api.elevenlabs.io/v1";
use std::env;

fn get_api_key() -> String {
    env::var("API_KEY").expect("API_KEY must be set")
}

#[tauri::command]
pub async fn get_models() -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/models", BASE_URL);
    let mut headers = HeaderMap::new();

    let api_key = get_api_key();

    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert("xi-api-key", HeaderValue::from_str(&api_key).unwrap());

    let response = client
        .get(&url)
        .headers(headers)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    println!("{}", response);

    Ok(response)
}

pub fn write_json_to_file(json_value: &Value, file_name: &str, path: &str) -> Result<bool, String> {
    let file_path = if path.ends_with("/") {
        path.to_string() + &file_name
    } else {
        path.to_string() + "/" + &file_name
    };
    let pretty_json = serde_json::to_string_pretty(&json_value).map_err(|e| e.to_string())?;
    let mut file = File::create(&file_path).map_err(|e| e.to_string())?;
    file.write_all(pretty_json.as_bytes())
        .map_err(|e| e.to_string())?;
    info!("Wrote file to path {}", file_path);
    Ok(true)
}

#[tauri::command]
pub async fn get_user_data() -> Result<UserData, String> {
    let client = reqwest::Client::new();
    let url = format!("{BASE_URL}/user");
    let api_key = get_api_key();
    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert("xi-api-key", HeaderValue::from_str(&api_key).unwrap());

    let response_text = client
        .get(url)
        .headers(headers)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    let json_value: Value = serde_json::from_str(&response_text).map_err(|e| e.to_string())?;

    write_json_to_file(
        &json_value,
        "user_output.json",
        "/Users/ryanweiler/Desktop/data",
    )?;

    let first_name = json_value["first_name"].as_str().unwrap_or("User").to_string();
    let character_count: i32 = json_value["subscription"]["character_count"].as_i64().unwrap_or(0) as i32;
    let character_limit: i32 = json_value["subscription"]["character_limit"].as_i64().unwrap_or(0) as i32;
    let next_character_count_reset_unix: u32 = json_value["subscription"]["next_character_count_reset_unix"].as_i64().unwrap_or(0) as u32;
    let voice_limit: i32 = json_value["subscription"]["voice_limit"].as_i64().unwrap_or(0) as i32;
    let voice_slots_used: i32 = json_value["subscription"]["voice_slots_used"].as_i64().unwrap_or(0) as i32;

    let user_data: UserData = UserData {
        first_name,
        character_limit,
        character_count,
        next_character_count_reset_unix,
        voice_limit,
        voice_slots_used
    };

    Ok(user_data)
}
