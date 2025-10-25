use std::fs;
use tauri::Manager;
use tauri_plugin_opener;

mod elevenlabs;
mod models;

use models::UserData;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_log::Builder::new()
                .targets([
                    tauri_plugin_log::Target::new(
                        tauri_plugin_log::TargetKind::Webview,
                    ),
                    tauri_plugin_log::Target::new(
                        tauri_plugin_log::TargetKind::Stdout,
                    ),
                    tauri_plugin_log::Target::new(
                        tauri_plugin_log::TargetKind::LogDir {
                            file_name: Some("logs".to_string()),
                        },
                    )
                ])
                .build(),
        )
        .setup(|app| {
            println!("Setting up Stronghold plugin...");

            let app_data_dir = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path");

            // Create the directory if it doesn't exist
            if !app_data_dir.exists() {
                println!("Creating app data directory: {:?}", app_data_dir);
                fs::create_dir_all(&app_data_dir).expect("failed to create app data directory");
            }

            let salt_path = app_data_dir.join("salt.txt");
            println!("Salt path: {:?}", salt_path);

            match app
                .handle()
                .plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())
            {
                Ok(_) => println!("Stronghold plugin initialized successfully!"),
                Err(e) => eprintln!("Failed to initialize Stronghold plugin: {:?}", e),
            }

            // This is how to prevent the window from becoming focused on hot reload
            #[cfg(all(target_os = "macos", debug_assertions))]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            elevenlabs::get_models,
            elevenlabs::get_user_data
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
