use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct TmdbMovieInfo {
    pub title: String,
    pub release_date: Option<String>,
}

#[derive(Debug, Deserialize, Clone)]
pub struct TmdbTvInfo {
    pub name: String,
    pub first_air_date: Option<String>,
}

pub struct TmdbResolver {
    client: reqwest::Client,
    api_key: String,
}

impl TmdbResolver {

    pub fn new(api_key: String) -> Self {

        Self {

            client:
                reqwest::Client::new(),

            api_key,
        }
    }

    // =====================================================
    // MOVIE
    // =====================================================

    pub async fn get_movie_info(

        &self,

        tmdb_id: &str,

    ) -> Option<(String, String)> {

        let url = format!(
            "https://api.themoviedb.org/3/movie/{}?api_key={}&language=en-US",
            tmdb_id,
            self.api_key
        );

        println!(
            "🎬 TMDB MOVIE URL => {}",
            url
        );

        let response = match self.client
            .get(&url)
            .send()
            .await
        {

            Ok(r) => r,

            Err(err) => {

                println!(
                    "❌ TMDB NETWORK ERROR => {}",
                    err
                );

                return None;
            }
        };

        println!(
            "📡 TMDB STATUS => {}",
            response.status()
        );

        let body = match response.text().await {

            Ok(text) => text,

            Err(err) => {

                println!(
                    "❌ TMDB BODY ERROR => {}",
                    err
                );

                return None;
            }
        };

        println!(
            "📄 TMDB RAW BODY => {}",
            body
        );

        let info: TmdbMovieInfo =

            match serde_json::from_str(&body) {

                Ok(data) => data,

                Err(err) => {

                    println!(
                        "❌ TMDB JSON ERROR => {}",
                        err
                    );

                    return None;
                }
            };

        let year = info
            .release_date
            .as_deref()
            .and_then(|d| d.get(0..4))
            .unwrap_or("")
            .to_string();

        Some((info.title, year))
    }

    // =====================================================
    // TV
    // =====================================================

    pub async fn get_tv_info(

        &self,

        tmdb_id: &str,

    ) -> Option<(String, String)> {

        let url = format!(
            "https://api.themoviedb.org/3/tv/{}?api_key={}&language=en-US",
            tmdb_id,
            self.api_key
        );

        println!(
            "📺 TMDB TV URL => {}",
            url
        );

        let response = match self.client
            .get(&url)
            .send()
            .await
        {

            Ok(r) => r,

            Err(err) => {

                println!(
                    "❌ TMDB NETWORK ERROR => {}",
                    err
                );

                return None;
            }
        };

        println!(
            "📡 TMDB STATUS => {}",
            response.status()
        );

        let body = match response.text().await {

            Ok(text) => text,

            Err(err) => {

                println!(
                    "❌ TMDB BODY ERROR => {}",
                    err
                );

                return None;
            }
        };

        println!(
            "📄 TMDB RAW BODY => {}",
            body
        );

        let info: TmdbTvInfo =

            match serde_json::from_str(&body) {

                Ok(data) => data,

                Err(err) => {

                    println!(
                        "❌ TMDB JSON ERROR => {}",
                        err
                    );

                    return None;
                }
            };

        let year = info
            .first_air_date
            .as_deref()
            .and_then(|d| d.get(0..4))
            .unwrap_or("")
            .to_string();

        Some((info.name, year))
    }
}