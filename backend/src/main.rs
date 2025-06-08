use poem::{EndpointExt, Route, Server, listener::TcpListener, middleware::Cors};
use poem_openapi::OpenApiService;

use backend::{TestApi, middleware::JwtMiddleware};

#[tokio::main]
async fn main() {
    let api_service = OpenApiService::new(TestApi, "evelynn.place-backend", "1.0");
    let swagger_ui = api_service.swagger_ui();

    let app = Route::new()
        .nest("/", api_service.with(JwtMiddleware))
        .nest("/docs", swagger_ui)
        .with(Cors::new());

    let _ = Server::new(TcpListener::bind("127.0.0.1:3000"))
        .run(app)
        .await;
}
