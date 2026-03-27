from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Greenware Defect Dashboard"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    sqlite_path: str = "greenware_local.db"

    firebase_enabled: bool = False
    firebase_credentials: str = ""
    firebase_project_id: str = ""

    use_mock_data: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
