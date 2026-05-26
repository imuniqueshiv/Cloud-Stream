use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct StreamResult {
    pub source_name: String,
    pub url: String,
    pub quality: String,
    pub is_m3u8: bool,
    pub referer: Option<String>,
    pub origin: Option<String>,
}

#[async_trait]
pub trait Provider: Send + Sync {
    fn name(&self) -> &str;

    // The new, universal signature
    async fn search(
        &self,
        tmdb_id: &str,
        title: &str,
        year: &str,
        media_type: &str,
        season: Option<u32>,
        episode: Option<u32>,
    ) -> Vec<StreamResult>;
}

pub mod manager;
pub mod playsrc;
pub mod vidsrc;

// pub mod vegamovies; // Add your CSX ports here later