package bootstrap

import (
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
	"gorm.io/gorm"
)

type HTTPModuleDeps struct {
	Validator *validator.Validator
}

type Modules struct {
	Entity *entity.Module
}

type ModuleDeps struct {
	DB        *gorm.DB
	TxManager database.TransactionManager
	HTTP      *HTTPModuleDeps
}

func NewModules(deps ModuleDeps) *Modules {
	var v *validator.Validator
	if deps.HTTP != nil {
		v = deps.HTTP.Validator
	}

	entityModule := entity.NewModule(entity.ModuleDeps{
		DB:        deps.DB,
		TxManager: deps.TxManager,
		Validator: v,
	})

	return &Modules{
		Entity: entityModule,
	}
}
