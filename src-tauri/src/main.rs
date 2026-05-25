// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod providers;
mod proxy;

use providers::manager::ProviderManager;

// This command exposes your Rust search logic to the React frontend
#[tauri::command]
async fn search_streams(query: String, media_type: String) -> Vec<providers::StreamResult> {
    let manager = ProviderManager::new();
    manager.search_all(&query, &media_type).await
}

fn main() {
    tauri::Builder::default()
        // Initialize the logging plugin for easier debugging
        .plugin(tauri_plugin_log::Builder::new().build())
        // Hook into the setup phase to safely start background services
        .setup(|_app| {
            // By putting this in .setup(), you ensure the Tauri 
            // async runtime is fully ready and initialized.
            proxy::start_proxy_server();
            Ok(())
        })
        // Register the command so the frontend can call invoke('search_streams', ...)
        .invoke_handler(tauri::generate_handler![search_streams])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}