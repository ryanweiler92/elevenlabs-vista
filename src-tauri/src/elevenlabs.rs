use crate::models;

use models::UserData;
use models::Voice;
use models::VoiceLabels;
use models::TTSRequest;
use reqwest;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};
use serde_json::Value;
use std::fs::File;
use std::io::prelude::*;
use log::{info, warn, error, debug, trace};
use std::env;
use futures_util::StreamExt;


const BASE_URL: &str = "https://api.elevenlabs.io/v1";
const BASE_URL_V2: &str = "https://api.elevenlabs.io/v2";


fn get_api_key() -> String {
    env::var("API_KEY").expect("API_KEY must be set")
}

#[tauri::command]
pub async fn stream_tts(
    request: TTSRequest,
    mut sender: tauri::ipc::Channel<Vec<u8>>
) -> Result<(), String> {
    info!("Starting TTS stream for voice_id: {}", request.voice_id);

    let client = reqwest::Client::new();
    let url = format!("{}/text-to-speech/{}/stream?output_format=mp3_44100_128",
                      BASE_URL, request.voice_id);

    info!("Streaming from URL: {}", url);

    let mut headers = HeaderMap::new();
    let api_key = get_api_key();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert("xi-api-key", HeaderValue::from_str(&api_key).unwrap());

    let body = serde_json::to_string(&request).map_err(|e| {
        error!("Failed to serialize request: {}", e);
        e.to_string()
    })?;

    info!("Request body: {}", body);

    let response = client
        .post(&url)
        .headers(headers)
        .body(body)
        .send()
        .await
        .map_err(|e| {
            error!("Failed to send request: {}", e);
            e.to_string()
        })?;

    let status = response.status();
    info!("Response status: {}", status);

    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
        error!("API error: {}", error_text);
        return Err(format!("API returned error {}: {}", status, error_text));
    }

    let mut stream = response.bytes_stream();
    let mut chunk_count = 0;
    let mut total_bytes = 0;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| {
            error!("Failed to read chunk: {}", e);
            e.to_string()
        })?;

        chunk_count += 1;
        total_bytes += chunk.len();

        if chunk_count % 10 == 0 {
            info!("Sent {} chunks, {} total bytes", chunk_count, total_bytes);
        }

        sender.send(chunk.to_vec()).map_err(|e| {
            error!("Failed to send chunk to frontend: {}", e);
            e.to_string()
        })?;
    }

    info!("Stream complete: {} chunks, {} total bytes", chunk_count, total_bytes);
    Ok(())
}

#[tauri::command]
pub async fn get_voices() -> Result<Vec<Voice>, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/voices", BASE_URL_V2);
    let mut headers = HeaderMap::new();

    let api_key = get_api_key();

    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert("xi-api-key", HeaderValue::from_str(&api_key).unwrap());

    let response = client
        .get(&url)
        .headers(headers)
        .query(&[("voice_type", "non-default"), ("page_size", "100")])
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    let json_value: Value = serde_json::from_str(&response).map_err(|e| e.to_string())?;

    write_json_to_file(
        &json_value,
        "voices_output.json",
        "/Users/ryanweiler/Desktop/data",
    )?;

    let mut voices: Vec<Voice> = Vec::new();

    if let Some(voices_array) = json_value["voices"].as_array() {
        for voice in voices_array {
            let voice_id = voice["voice_id"].as_str().unwrap_or("N/A").to_string();
            let name = voice["name"].as_str().unwrap_or("N/A").to_string();
            let category = voice["category"].as_str().unwrap_or("N/A").to_string();
            let preview_url = voice["preview_url"].as_str().unwrap_or("N/A").to_string();
            let description = voice["description"].as_str().unwrap_or("N/A").to_string();

            let accent = voice["labels"]["accent"].as_str().unwrap_or("N/A").to_string();
            let gender = voice["labels"]["gender"].as_str().unwrap_or("N/A").to_string();
            let age = voice["labels"]["age"].as_str().unwrap_or("N/A").to_string();
            let descriptive = voice["labels"]["descriptive"].as_str().unwrap_or("N/A").to_string();
            let use_case = voice["labels"]["use_case"].as_str().unwrap_or("N/A").to_string();

            let labels = VoiceLabels {
                accent,
                gender,
                age,
                descriptive,
                use_case
            };

            let voice_data = Voice {
                voice_id,
                name,
                category,
                preview_url,
                description,
                labels
            };

            voices.push(voice_data);
        }
    }
    Ok(voices)
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
