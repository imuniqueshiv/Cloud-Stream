use crate::providers::{
    Provider,
    StreamResult,
};

use crate::providers::playsrc::PlaySrcProvider;
use crate::providers::vidsrc::VidSrcProvider;

use std::sync::Arc;

use tokio::time::{
    timeout,
    Duration,
};

pub struct ProviderManager {
    providers: Vec<Arc<dyn Provider>>,
}

impl ProviderManager {

    pub fn new() -> Self {

        println!(
            "📦 Initializing Providers..."
        );

        Self {

            providers: vec![

                // Arc::new(
                //     PlaySrcProvider::new()
                // ),
                Arc::new(VidSrcProvider::new()),

            ],
        }
    }

    pub async fn search_all(

        &self,

        tmdb_id: &str,

        title: &str,

        year: &str,

        media_type: &str,

        season: Option<u32>,

        episode: Option<u32>,

    ) -> Vec<StreamResult> {

        let mut tasks = Vec::new();

        let timeout_duration =
            Duration::from_secs(12);

        let t_id =
            tmdb_id.to_string();

        let t =
            title.to_string();

        let y =
            year.to_string();

        let mt =
            media_type.to_string();

        for provider in &self.providers {

            let p =
                Arc::clone(provider);

            let t_id_c =
                t_id.clone();

            let t_c =
                t.clone();

            let y_c =
                y.clone();

            let mt_c =
                mt.clone();

            println!(
                "🔍 Searching Provider => {}",
                p.name()
            );

            tasks.push(
                tokio::spawn(async move {

                    match timeout(

                        timeout_duration,

                        p.search(
                            &t_id_c,
                            &t_c,
                            &y_c,
                            &mt_c,
                            season,
                            episode
                        )

                    ).await {

                        Ok(results) => {

                            println!(
                                "✅ Provider '{}' returned {} streams",
                                p.name(),
                                results.len()
                            );

                            results
                        }

                        Err(_) => {

                            println!(
                                "⚠️ Provider '{}' timed out",
                                p.name()
                            );

                            vec![]
                        }
                    }
                })
            );
        }

        let mut all_results =
            Vec::new();

        for task in tasks {

            if let Ok(res) =
                task.await {

                all_results.extend(res);
            }
        }

        all_results
    }
}