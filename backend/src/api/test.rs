use poem_openapi::{Object, OpenApi, payload::Json};

use crate::middleware::{JwtAuth, JwtErrorResponses};

#[derive(Object)]
struct EchoClaimsResponse {
    claims: String,
}

pub struct TestApi;
#[OpenApi]
impl TestApi {
    #[oai(path = "/test/echo-claims", method = "get")]
    async fn echo_claims(
        &self,
        auth: JwtAuth,
    ) -> Result<Json<EchoClaimsResponse>, JwtErrorResponses> {
        let response = if let Ok(some_str) = serde_json::to_string(&auth.0) {
            some_str
        } else {
            "Something went wrong D:".to_string()
        };

        Ok(Json(EchoClaimsResponse { claims: response }))
    }
}
