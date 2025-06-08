pub mod claims;

use claims::Claims;
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode, errors::ErrorKind};
use poem_openapi::{ApiResponse, Object, SecurityScheme, auth::Bearer, payload::Json};

use crate::config::CONFIG;

#[derive(SecurityScheme)]
#[oai(
    ty = "bearer",
    key_name = "JWT",
    key_in = "header",
    checker = "jwt_checker"
)]
pub struct JwtAuth(pub Claims);

#[derive(ApiResponse)]
pub enum JwtErrorResponses {
    #[oai(status = 401)]
    Unauthorized(Json<ErrorResponse>),

    #[oai(status = 403)]
    Forbidden(Json<ErrorResponse>),

    #[oai(status = 400)]
    BadRequest(Json<ErrorResponse>),
}

#[derive(Object)]
pub struct ErrorResponse {
    pub code: String,
    pub message: String,
    #[oai(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

async fn jwt_checker(_req: &poem::Request, bearer: Bearer) -> poem::Result<Claims> {
    let mut validation = Validation::new(Algorithm::HS256);
    validation.validate_exp = true;
    validation.set_audience(&["authenticated"]);

    let token_data = decode::<Claims>(
        &bearer.token,
        &DecodingKey::from_secret(CONFIG.jwt_secret.clone().as_bytes()),
        &validation,
    )
    .map_err(|e| match e.kind() {
        ErrorKind::ExpiredSignature => JwtErrorResponses::Unauthorized(Json(ErrorResponse {
            code: "JWT_EXPIRED".to_string(),
            message: "Token has expired".to_string(),
            details: Some("Please renew your authentication".to_string()),
        })),

        ErrorKind::InvalidSignature => JwtErrorResponses::Unauthorized(Json(ErrorResponse {
            code: "JWT_INVALID".to_string(),
            message: "Invalid token signature".to_string(),
            details: None,
        })),

        _ => JwtErrorResponses::BadRequest(Json(ErrorResponse {
            code: "JWT_MALFORMED".to_string(),
            message: "Invalid token format".to_string(),
            details: Some("Ensure you're sending a properly formatted JWT".to_string()),
        })),
    })?;

    Ok(token_data.claims)
}
