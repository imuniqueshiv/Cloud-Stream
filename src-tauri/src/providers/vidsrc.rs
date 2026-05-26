use crate::providers::{Provider, StreamResult};

use async_trait::async_trait;

pub struct VidSrcProvider;

impl VidSrcProvider {
    pub fn new() -> Self {
        Self
    }
}

#[async_trait]
impl Provider for VidSrcProvider {

    fn name(&self) -> &str {
        "VidSrc"
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

        let url = if media_type == "movie" {

            format!(
                "https://vidsrc.cc/v2/embed/movie/{}",
                tmdb_id
            )

        } else {

            format!(
                "https://vidsrc.cc/v2/embed/tv/{}/{}-{}",
                tmdb_id,
                season.unwrap_or(1),
                episode.unwrap_or(1)
            )
        };

        vec![
            StreamResult {

                source_name:
                    "VidSrc".to_string(),

                url,

                quality:
                    "Auto".to_string(),

                is_m3u8:
                    false,

                referer:
                    None,

                origin:
                    None,
            }
        ]
    }
}