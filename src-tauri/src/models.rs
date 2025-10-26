use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct UserData {
    pub first_name: String,
    pub character_limit: i32,
    pub character_count: i32,
    pub next_character_count_reset_unix: u32,
    pub voice_limit: i32,
    pub voice_slots_used: i32,
}

#[derive(Serialize, Deserialize)]
pub struct Voice {
    pub voice_id: String,
    pub name: String,
    pub category: String,
    pub description: String,
    pub preview_url: String,
    pub labels: VoiceLabels
}

#[derive(Serialize, Deserialize)]
pub struct VoiceLabels {
    pub accent: String,
    pub descriptive: String,
    pub age: String,
    pub gender: String,
    pub use_case: String
}

#[derive(Serialize, Deserialize)]
pub struct TTSRequest {
    pub voice_id: String,
    pub text: String,
    pub model_id: String,
    pub voice_settings: VoiceSettings,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub previous_text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub previous_request_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_request_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next_request_text: Option<String>,
    pub download_directory: String
}

#[derive(Serialize, Deserialize)]
pub struct VoiceSettings {
    // 0.0 to 1.0
    pub stability: f32,
    pub use_speaker_boost: bool,
    // 0.0 to 1.0
    pub similarity_boost: f32,
    // 0.0 to ??
    pub style: f32,
    // 0.0 to 2.0?
    pub speed: f32
}