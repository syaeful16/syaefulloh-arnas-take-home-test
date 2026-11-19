package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CategoryRepository interface {
	FindAll(ctx context.Context) ([]entities.Category, error)
	FindOrCreateByName(ctx context.Context, cat *entities.Category) (*entities.Category, error)
	Delete(ctx context.Context, id uuid.UUID) (int64, error)
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll(ctx context.Context) ([]entities.Category, error) {
	var list []entities.Category
	err := database.GetDB(ctx, r.db).Order("name ASC").Find(&list).Error
	return list, err
}

func (r *categoryRepository) FindOrCreateByName(ctx context.Context, cat *entities.Category) (*entities.Category, error) {
	db := database.GetDB(ctx, r.db)
	name := strings.TrimSpace(cat.Name)
	cat.Name = name

	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "name"}},
		DoNothing: true,
	}).Create(cat).Error
	if err != nil {
		return nil, err
	}

	var result entities.Category
	if err := db.Where("LOWER(name) = LOWER(?)", name).First(&result).Error; err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *categoryRepository) Delete(ctx context.Context, id uuid.UUID) (int64, error) {
	res := database.GetDB(ctx, r.db).Delete(&entities.Category{}, "id = ?", id)
	return res.RowsAffected, res.Error
}
