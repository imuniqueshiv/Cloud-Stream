use crate::providers::{Provider, StreamResult};

use async_trait::async_trait;

use reqwest::{
    Client,
    header::{
        HeaderMap,
        HeaderValue,
        ACCEPT,
        ACCEPT_LANGUAGE,
        CONNECTION,
        ORIGIN,
        REFERER,
        USER_AGENT,
    },
};

use serde::Deserialize;

use std::time::Duration;

#[derive(Debug, Deserialize)]
struct PlaySrcResponse {
    file: Option<String>,
}

pub struct PlaySrcProvider {
    client: Client,
}

impl PlaySrcProvider {

    pub fn new() -> Self {

        let mut headers = HeaderMap::new();

        headers.insert(
            USER_AGENT,
            HeaderValue::from_static(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            ),
        );

        headers.insert(
            ACCEPT,
            HeaderValue::from_static("*/*"),
        );

        headers.insert(
            ACCEPT_LANGUAGE,
            HeaderValue::from_static("en-US,en;q=0.9"),
        );

        headers.insert(
            CONNECTION,
            HeaderValue::from_static("keep-alive"),
        );

        headers.insert(
            ORIGIN,
            HeaderValue::from_static("https://madplay.site"),
        );

        headers.insert(
            REFERER,
            HeaderValue::from_static("https://madplay.site/"),
        );

        let client = Client::builder()

            .default_headers(headers)

            .danger_accept_invalid_certs(true)

            .timeout(Duration::from_secs(15))

            .build()

            .unwrap_or_else(|_| Client::new());

        Self { client }
    }
}

#[async_trait]
impl Provider for PlaySrcProvider {

    fn name(&self) -> &str {
        "PlaySrc"
    }

    async fn search(

        &self,

        tmdb_id: &str,

        _title: &str,

        _year: &str,

        media_type: &str,

        season: Option<u32>,

        episode: Option<u32>,

    ) -> Vec<StreamResult> {

        println!(
            "\n🎬 PlaySrc Provider Started"
        );

        println!(
            "📀 TMDB ID => {}",
            tmdb_id
        );

        println!(
            "🎞 TYPE => {}",
            media_type
        );

        // =====================================================
        // BUILD URL
        // =====================================================

        let url = if media_type == "movie" {

            format!(
                "https://api.madplay.site/api/playsrc?id={}&type=movie",
                tmdb_id
            )

        } else {

            let s = season.unwrap_or(1);

            let e = episode.unwrap_or(1);

            format!(
                "https://api.madplay.site/api/playsrc?id={}&type=tv&season={}&episode={}",
                tmdb_id,
                s,
                e
            )
        };

        println!(
            "🌐 REQUEST URL => {}",
            url
        );

        // =====================================================
        // SEND REQUEST
        // =====================================================

        let response = match self.client
            .get(&url)
            .send()
            .await
        {

            Ok(r) => r,

            Err(err) => {

                println!(
                    "❌ NETWORK ERROR => {}",
                    err
                );

                return vec![];
            }
        };

        println!(
            "📡 STATUS => {}",
            response.status()
        );

        if !response.status().is_success() {

            println!(
                "❌ REQUEST FAILED"
            );

            return vec![];
        }

        // =====================================================
        // GET RAW BODY
        // =====================================================

        let raw_body = match response.text().await {

            Ok(text) => text,

            Err(err) => {

                println!(
                    "❌ BODY ERROR => {}",
                    err
                );

                return vec![];
            }
        };

        println!(
            "📄 RAW RESPONSE => {}",
            raw_body
        );

        if raw_body.is_empty() {

            println!(
                "❌ EMPTY RESPONSE"
            );

            return vec![];
        }

        // =====================================================
        // PARSE JSON
        // =====================================================

        let parsed: Vec<PlaySrcResponse> =

            match serde_json::from_str(&raw_body) {

                Ok(data) => data,

                Err(err) => {

                    println!(
                        "❌ JSON PARSE ERROR => {}",
                        err
                    );

                    return vec![];
                }
            };

        println!(
            "📦 PARSED STREAMS => {}",
            parsed.len()
        );

        // =====================================================
        // MAP STREAMS
        // =====================================================

        let streams: Vec<StreamResult> =

            parsed

            .into_iter()

            .filter_map(|item| {

                let file_url = item.file?;

                if file_url.trim().is_empty() {

                    return None;
                }

                println!(
                    "🔗 STREAM => {}",
                    file_url
                );

                Some(StreamResult {

    source_name:
        "PlaySrc".to_string(),

    url:
        file_url.clone(),

    quality:
        "1080p".to_string(),

    is_m3u8:
        file_url.contains(".m3u8"),

    referer:
        Some(
            "https://madplay.site/"
                .to_string()
        ),

    origin:
        Some(
            "https://madplay.site"
                .to_string()
        ),
})
            })

            .collect();

        println!(
            "✅ FINAL STREAM COUNT => {}",
            streams.len()
        );

        streams
    }
}