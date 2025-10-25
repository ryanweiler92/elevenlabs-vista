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
