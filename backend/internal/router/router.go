package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/bootstrap"
)

func Setup(app *fiber.App, api *bootstrap.API) {

	v1 := app.Group("/api")
	if api.Modules != nil {
		if api.Modules.Category != nil {
			api.Modules.Category.RegisterRoutes(v1)
		}
		// if api.Modules.Entity != nil {
		// 	api.Modules.Entity.RegisterRoutes(v1)
		// }
	}

}
