package bootstrap

import (
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	category "github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
	"gorm.io/gorm"
)

type HTTPModuleDeps struct {
	Validator *validator.Validator
}

type Modules struct {
	Category *category.Module
	// Entity   *entities.Module
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

	categoryModule := category.NewModule(category.ModuleDeps{
		DB:        deps.DB,
		TxManager: deps.TxManager,
		Validator: v,
	})

	// entityModule := entity.NewModule(entity.ModuleDeps{
	// 	DB:              deps.DB,
	// 	TxManager:       deps.TxManager,
	// 	Validator:       v,
	// 	CategoryService: categoryModule.Service,
	// })

	return &Modules{
		Category: categoryModule,
		// Entity:   entityModule,
	}
}
