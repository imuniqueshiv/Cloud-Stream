use crate::providers::{Provider, StreamResult};
use crate::providers::example_scraper::CineStreamProvider;
use std::sync::Arc;
use tokio::time::{timeout, Duration};

pub struct ProviderManager {
    // We use Arc (Atomic Reference Counted) to safely share providers across Tokio threads
    providers: Vec<Arc<dyn Provider>>,
}

impl ProviderManager {
    pub fn new() -> Self {
        Self {
            providers: vec![
                Arc::new(CineStreamProvider),
                // Arc::new(AnimeScraperProvider), <-- Add new scrapers here
            ],
        }
    }

    pub async fn search_all(&self, query: &str, media_type: &str) -> Vec<StreamResult> {
        let mut tasks = Vec::new();
        // Set a maximum time a scraper is allowed to run before we abandon it
        let timeout_duration = Duration::from_secs(8);

        // Spawn a concurrent task for every provider
        for provider in &self.providers {
            let provider_clone = Arc::clone(provider);
            let q = query.to_string();
            let mt = media_type.to_string();

            tasks.push(tokio::spawn(async move {
                // Wrap the search function in a timeout
                match timeout(timeout_duration, provider_clone.search(&q, &mt)).await {
                    Ok(results) => results, // Scraper finished in time
                    Err(_) => {
                        eprintln!("⚠️ Timeout: Provider '{}' took too long.", provider_clone.name());
                        vec![] // Return empty results for this specific scraper
                    }
                }
            }));
        }

        // Wait for all Tokio threads to finish and collect the results
        let mut all_results = Vec::new();
        for task in tasks {
            if let Ok(res) = task.await {
                all_results.extend(res);
            }
        }
        
        all_results
    }
}