// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod proxy;
mod tmdb;
mod providers;

use providers::manager::ProviderManager;
use tmdb::TmdbResolver;

#[tauri::command]
async fn search_streams(
    tmdb_id: String,
    media_type: String,
) -> Result<Vec<providers::StreamResult>, String> {

    println!(
        "\n=============================="
    );

    println!(
        "🔎 Incoming Request => ID: {} | TYPE: {}",
        tmdb_id,
        media_type
    );

    // =====================================================
    // LOAD ENV
    // =====================================================
    let tmdb_api_key =
        std::env::var("VITE_TMDB_API_KEY")
            .unwrap_or_default();

    println!(
        "🔑 TMDB KEY EXISTS => {}",
        !tmdb_api_key.is_empty()
    );

    if tmdb_api_key.is_empty() {
        return Err(
            "TMDB API key missing".to_string()
        );
    }

    // =====================================================
    // INIT TMDB
    // =====================================================
    let resolver =
        TmdbResolver::new(tmdb_api_key);

    // =====================================================
    // RESOLVE METADATA
    // =====================================================
    let metadata =
        if media_type == "movie" {

            resolver
                .get_movie_info(&tmdb_id)
                .await

        } else {

            resolver
                .get_tv_info(&tmdb_id)
                .await
        };

    let (title, year) = match metadata {

        Some(data) => data,

        None => {

            println!(
                "❌ TMDB metadata resolution failed"
            );

            return Err(
                "TMDB metadata failed"
                    .to_string()
            );
        }
    };

    println!(
        "🎬 Metadata => {} ({})",
        title,
        year
    );

    // =====================================================
    // PROVIDER SEARCH
    // =====================================================
    println!(
        "🚀 Starting provider search..."
    );

    let manager =
        ProviderManager::new();

    let results = manager
        .search_all(
            &tmdb_id,
            &title,
            &year,
            &media_type,
            None,
            None,
        )
        .await;

    println!(
        "🎥 Streams Found => {}",
        results.len()
    );

    for stream in &results {

        println!(
            "📺 {} [{}]",
            stream.source_name,
            stream.quality
        );

        println!(
            "🔗 {}",
            stream.url
        );
    }

    if results.is_empty() {

        println!(
            "❌ NO STREAMS FOUND"
        );

        return Err(format!(
            "No streams found for {}",
            title
        ));
    }

    Ok(results)
}

fn main() {

    dotenvy::dotenv().ok();

    tauri::Builder::default()

        .setup(|_app| {

            tauri::async_runtime::spawn(
                async {

                    println!(
                        "🚀 Local Video Proxy listening on http://127.0.0.1:8765"
                    );

                    proxy::start_proxy_server();
                }
            );

            Ok(())
        })

        .invoke_handler(
            tauri::generate_handler![
                search_streams
            ]
        )

        .run(
            tauri::generate_context!()
        )

        .expect(
            "error while running tauri application"
        );
}