use poem::web::Data;
use poem_openapi::{Object, OpenApi, payload::Json};

use crate::Claims;

#[derive(Object)]
struct PenisResponse {
    genital: String,
}

pub struct TestApi;
#[OpenApi]
impl TestApi {
    #[oai(path = "/test", method = "get")]
    async fn hello(&self, Data(claims): Data<&Claims>) -> Json<PenisResponse> {
        let response = if let Ok(some_str) = serde_json::to_string(claims) {
            some_str
        } else {
            "Bro".into()
        };

        Json(PenisResponse {
            // genital: jwt_claims.clone().0,
            genital: response,
        })
    }
}
