use axum::{
    extract::Query,
    http::{HeaderMap, StatusCode},
    response::IntoResponse,
    routing::get,
    Router,
};
use reqwest::Client;
use serde::Deserialize;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
// Import the new base64 traits
use base64::{engine::general_purpose, Engine as _};

#[derive(Deserialize)]
pub struct ProxyQuery {
    url: String,
    referer: Option<String>,
    origin: Option<String>,
}

async fn video_proxy(
    Query(params): Query<ProxyQuery>,
    req_headers: HeaderMap,
) -> impl IntoResponse {
    // 1. Decode using the modern Engine API
    let target_url_bytes = match general_purpose::STANDARD.decode(&params.url) {
        Ok(b) => b,
        Err(e) => {
            eprintln!("⚠️ Proxy Error: Invalid Base64 URL - {}", e);
            return (StatusCode::BAD_REQUEST, "Invalid Base64 URL").into_response();
        }
    };
    let target_url = String::from_utf8_lossy(&target_url_bytes).to_string();

    let client = Client::new();
    let mut request = client.get(&target_url);

    // Forward standard video streaming headers
    if let Some(range) = req_headers.get("range") {
        request = request.header("Range", range);
    }
    if let Some(ref referer) = params.referer {
        request = request.header("Referer", referer);
    }
    if let Some(ref origin) = params.origin {
        request = request.header("Origin", origin);
    }
    
    // Disguise the proxy as a standard web browser
    request = request.header(
        "User-Agent", 
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Fetch the video from the remote server
    let response = match request.send().await {
        Ok(res) => res,
        Err(e) => {
            eprintln!("⚠️ Proxy Error: Failed to fetch video - {}", e);
            return (StatusCode::BAD_GATEWAY, "Failed to fetch video").into_response();
        }
    };

    let mut resp_builder = axum::http::Response::builder().status(response.status());

    // Forward necessary headers back to the frontend video player
    let headers_to_forward = ["content-type", "content-length", "content-range", "accept-ranges"];
    for header_name in headers_to_forward {
        if let Some(header_val) = response.headers().get(header_name) {
            resp_builder = resp_builder.header(header_name, header_val);
        }
    }

    // Stream the body chunks directly to the frontend
    let stream = response.bytes_stream();
    let body = axum::body::Body::from_stream(stream);

    resp_builder.body(body).unwrap().into_response()
}

pub fn start_proxy_server() {
    // Use tauri's own async runtime to ensure we are inside the correct context
    tauri::async_runtime::spawn(async {
        let app = Router::new()
            .route("/ping", get(|| async { "Proxy is alive!" })) // Helpful for frontend health checks
            .route("/proxy", get(video_proxy))
            .layer(CorsLayer::permissive());

        let listener = TcpListener::bind("127.0.0.1:8765").await.expect("Failed to bind to port 8765");
        println!("🚀 Local Video Proxy listening on http://{}", listener.local_addr().unwrap());
        
        axum::serve(listener, app).await.expect("Axum server failed");
    });
}