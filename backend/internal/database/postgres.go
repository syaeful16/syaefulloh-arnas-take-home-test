package database

import (
	"log"

	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewPostgres(cfg config.DatabaseConfig) *gorm.DB {
	db, err := gorm.Open(
		postgres.Open(cfg.DSN()),
		&gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		},
	)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}
	return db
}
