pub mod claims;

use claims::Claims;
use jsonwebtoken::{Algorithm, DecodingKey, Validation, decode};
use poem::{Endpoint, Middleware, http::StatusCode};

use crate::ENV_VARIABLES;

pub struct JwtMiddleware;

impl<E: Endpoint> Middleware<E> for JwtMiddleware {
    type Output = JwtMiddlewareImpl<E>;

    fn transform(&self, ep: E) -> Self::Output {
        JwtMiddlewareImpl { ep }
    }
}

pub struct JwtMiddlewareImpl<E> {
    pub ep: E,
}

impl<E: Endpoint> Endpoint for JwtMiddlewareImpl<E> {
    type Output = E::Output;

    async fn call(&self, mut req: poem::Request) -> poem::Result<Self::Output> {
        let token = req
            .headers()
            .get("Authorization")
            .and_then(|value| value.to_str().ok())
            .and_then(|s| s.strip_prefix("Bearer "))
            .ok_or_else(|| poem::Error::from_string("Missing token", StatusCode::UNAUTHORIZED))?;

        let mut validation = Validation::new(Algorithm::HS256);
        validation.validate_exp = true;
        validation.set_audience(&["authenticated"]);

        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(ENV_VARIABLES.jwt_secret.clone().as_bytes()),
            &validation,
        )
        .map_err(|e| match e.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => {
                println!("{}", e);
                poem::Error::from_string("Token expired", StatusCode::UNAUTHORIZED)
            }
            _ => {
                println!("{}", e);
                poem::Error::from_string("Invalid Token", StatusCode::UNAUTHORIZED)
            }
        })?;

        req.extensions_mut().insert(token_data.claims);

        self.ep.call(req).await
    }
}
