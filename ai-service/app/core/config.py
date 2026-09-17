from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    # MySQL Database Config
    DB_USER: str = "root"
    DB_PASSWORD: str = "1234"
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_NAME: str = "tomorrow_market"
    
    # NCP API
    NCP_CLIENT_ID: str
    NCP_CLIENT_SECRET: str
    
    # Webhook
    BACKEND_WEBHOOK_URL: str = "http://localhost:8080/api/batch/crawling-done"

    @property
    def DATABASE_URL(self) -> str:
        # SQLAlchemy URL format for PyMySQL
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = ConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
