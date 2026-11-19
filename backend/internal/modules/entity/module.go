package entity

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
	CategoryService services.CategoryService
	EntityService   services.EntityService
	CategoryHandler handlers.CategoryHandler
	EntityHandler   handlers.EntityHandler
}

type ModuleDeps struct {
	DB        *gorm.DB
	TxManager database.TransactionManager
	Validator *validator.Validator
}

func NewModule(deps ModuleDeps) *Module {
	// repositories
	categoryRepo := repositories.NewCategoryRepository(deps.DB)
	entityRepo := repositories.NewEntityRepository(deps.DB)

	// services
	categoryService := services.NewCategoryService(categoryRepo, deps.TxManager)
	entityService := services.NewEntityService(entityRepo, categoryService, deps.TxManager)

	// handlers
	categoryHandler := handlers.NewCategoryHandler(categoryService, deps.Validator)
	entityHandler := handlers.NewEntityHandler(entityService, deps.Validator)

	return &Module{
		CategoryService: categoryService,
		EntityService:   entityService,
		CategoryHandler: *categoryHandler,
		EntityHandler:   *entityHandler,
	}
}

func (m *Module) RegisterRoutes(router fiber.Router) {
	categoriesGroup := router.Group("/categories")
	categoriesGroup.Get("/", m.CategoryHandler.GetAllCategories)

	entitiesGroup := router.Group("/entities")
	entitiesGroup.Get("/", m.EntityHandler.GetAllEntities)
	entitiesGroup.Get("/:id", m.EntityHandler.GetEntityByID)
	entitiesGroup.Post("/", m.EntityHandler.CreateEntity)
	entitiesGroup.Put("/:id", m.EntityHandler.UpdateEntity)
	entitiesGroup.Delete("/:id", m.EntityHandler.DeleteEntity)

}
