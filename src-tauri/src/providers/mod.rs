pub mod example_scraper;
pub mod manager;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StreamResult {
    pub source_name: String,
    pub url: String,
    pub quality: String,
    pub is_m3u8: bool,
    pub referer: Option<String>,
}

#[async_trait]
pub trait Provider: Send + Sync {
    // Each scraper must have a unique name
    fn name(&self) -> &str;
    
    // The core search function: takes a TMDB ID/Query and returns potential links
    async fn search(&self, query: &str, media_type: &str) -> Vec<StreamResult>;
}