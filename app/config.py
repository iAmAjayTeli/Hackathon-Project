from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # MongoDB Configuration
    MONGODB_URI: str = "mongodb://localhost:27017/empathiccall"

    # CORS Settings
    FRONTEND_URL: str = "http://localhost:5173"

    # API Keys
    AZURE_COGNITIVE_SERVICES_KEY: Optional[str] = None
    GOOGLE_CLOUD_API_KEY: Optional[str] = None
    IBM_WATSON_API_KEY: Optional[str] = None

    # Security
    JWT_SECRET: str = "your_jwt_secret_here"  # Change in production
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 