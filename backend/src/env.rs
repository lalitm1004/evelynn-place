use once_cell::sync::Lazy;
use std::env;

pub struct EnvVariables {
    pub jwt_secret: String,
    pub database_url: String,
}

pub static ENV_VARIABLES: Lazy<EnvVariables> = Lazy::new(|| {
    dotenvy::dotenv().ok();

    EnvVariables {
        jwt_secret: (env::var("JWT_SECRET").expect("JWT_SECRET must be set.")),
        database_url: (env::var("DATABASE_URL").expect("DATABASE_URL must be set.")),
    }
});
