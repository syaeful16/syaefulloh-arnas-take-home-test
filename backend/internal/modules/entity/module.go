package category

import (
	"github.com/gofiber/fiber/v2"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/handlers"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/repositories"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/services"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
	"gorm.io/gorm"
)

type Module struct {
	Service services.CategoryService
	Handler handlers.CategoryHandler
}

type ModuleDeps struct {
	DB *gorm.DB
	TxManager database.TransactionManager
	Validator *validator.Validator
}

func NewModule(deps ModuleDeps) *Module {
	// repositories
	categoryRepo := repositories.NewCategoryRepository(deps.DB)

	// services
	categoryService := services.NewCategoryService(categoryRepo, deps.TxManager)

	// handlers
	categoryHandler := handlers.NewCategoryHandler(categoryService, deps.Validator)

	return &Module{
		Service: categoryService,
		Handler: *categoryHandler,
	}
}

func (m *Module) RegisterRoutes(router fiber.Router) {
	categoriesGroup := router.Group("/categories")

	categoriesGroup.Get("/", m.Handler.GetAllCategories)
}
