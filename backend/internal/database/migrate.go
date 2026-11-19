package database

import (
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"gorm.io/gorm"
)

func Migrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&entities.Category{},
		&entities.Entity{},
	)
}
