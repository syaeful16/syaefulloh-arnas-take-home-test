package bootstrap

import (
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/config"
	"gorm.io/gorm"
)

type Database struct {
	DB        *gorm.DB
	TxManager database.TransactionManager
}

func NewDatabase(cfg *config.Config) *Database {
	db := database.NewPostgres(cfg.DB)
	txManager := database.NewTransactionManager(db)

	return &Database{
		DB:        db,
		TxManager: txManager,
	}
}
