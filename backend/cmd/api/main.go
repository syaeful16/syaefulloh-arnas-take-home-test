package main

import (
	"log"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/bootstrap"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	// "github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database/seeders"
	// catEntities "github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/category/entities"
	entEntities "github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/router"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/config"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
)

func main() {
	cfg := config.Load()

	db := database.NewPostgres(cfg.DB)
	if sqlDB, err := db.DB(); err == nil {
		defer sqlDB.Close()
	}

	if err := db.AutoMigrate(
		// &catEntities.Category{},
		&entEntities.Entity{},
	); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	txManager := database.NewTransactionManager(db)
	v := validator.NewValidator()

	apiApp := bootstrap.SetupAPI(cfg, db, txManager, v)
	// seeders.SeedEntities(db, apiApp.Modules.Category.Service)

	app := fiber.New(fiber.Config{
		AppName: cfg.App.Name,
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Join(cfg.CORS.AllowedOrigins, ","),
		AllowMethods:     strings.Join(cfg.CORS.AllowedMethods, ","),
		AllowHeaders:     strings.Join(cfg.CORS.AllowedHeaders, ","),
		AllowCredentials: cfg.CORS.AllowCredentials,
	}))

	router.Setup(app, apiApp)

	port := cfg.App.Port
	if port == "" {
		port = "8080"
	}

	log.Printf("%s running on http://localhost:%s (%s)", cfg.App.Name, port, cfg.App.Env)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
