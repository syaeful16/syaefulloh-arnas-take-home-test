package config

import (
	"fmt"
	"log"
	"sync"

	"github.com/joho/godotenv"
	"github.com/syaeful16/envloader"
)

type Config struct {
	App  AppConfig
	CORS CORSConfig
	DB   DatabaseConfig
}

type AppConfig struct {
	Name string `env:"APP_NAME" default:"Geographic Entity API"`
	Env  string `env:"APP_ENV" default:"development"`
	Port string `env:"APP_PORT" default:"8080"`
}

type CORSConfig struct {
	AllowedOrigins   []string `env:"CORS_ALLOWED_ORIGINS" default:"*"`
	AllowedMethods   []string `env:"CORS_ALLOWED_METHODS" default:"GET,POST,PUT,DELETE,OPTIONS"`
	AllowedHeaders   []string `env:"CORS_ALLOWED_HEADERS" default:"*"`
	AllowCredentials bool     `env:"CORS_ALLOW_CREDENTIALS" default:"false"`
}

type DatabaseConfig struct {
	Host     string `env:"DB_HOST" required:"true"`
	Port     int    `env:"DB_PORT" default:"5432"`
	User     string `env:"DB_USER" required:"true"`
	Password string `env:"DB_PASSWORD" required:"true"`
	Name     string `env:"DB_NAME" required:"true"`
	SSLMode  string `env:"DB_SSL_MODE" default:"disable"`
}

func (d DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode,
	)
}

var (
	cfg  *Config
	once sync.Once
)

func Load() *Config {
	once.Do(func() {
		_ = godotenv.Load(".env", "../.env", "../../.env")

		c := &Config{}
		if err := envloader.Load(c); err != nil {
			log.Fatalf("failed to load configuration: %v", err)
		}
		cfg = c
	})
	return cfg
}
