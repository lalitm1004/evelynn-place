use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Claims {
    #[serde(rename = "sub")]
    pub user_id: String,

    #[serde(rename = "app_metadata")]
    pub app_metadata: AppMetadata,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppMetadata {
    #[serde(rename = "custom_claims")]
    pub custom_claims: CustomClaims,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CustomClaims {
    pub is_whitelisted: bool,

    #[serde(rename = "type")]
    pub user_type: UserType,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Eq, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum UserType {
    Admin,
    Helper,
    Base,
}

impl Claims {
    pub fn get_type(&self) -> &UserType {
        &self.app_metadata.custom_claims.user_type
    }
}
