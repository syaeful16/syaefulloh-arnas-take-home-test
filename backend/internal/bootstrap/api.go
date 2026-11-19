package bootstrap

import (
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/config"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
	"gorm.io/gorm"
)

type API struct {
	Config   *config.Config
	Database *Database
	Modules  *Modules
}

func SetupAPI(cfg *config.Config, db *gorm.DB, txManager database.TransactionManager, v *validator.Validator) *API {
	mods := NewModules(ModuleDeps{
		DB:        db,
		TxManager: txManager,
		HTTP: &HTTPModuleDeps{
			Validator: v,
		},
	})

	return &API{
		Config: cfg,
		Database: &Database{
			DB:        db,
			TxManager: txManager,
		},
		Modules: mods,
	}
}
