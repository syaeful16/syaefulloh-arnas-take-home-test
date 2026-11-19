package repositories

import (
	"context"
	"strings"

	"github.com/google/uuid"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/dto"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"gorm.io/gorm"
)

type EntityRepository interface {
	FindAll(ctx context.Context, filter dto.GetEntityQuery) ([]entities.Entity, error)
	FindByID(ctx context.Context, id uuid.UUID) (*entities.Entity, error)
	Create(ctx context.Context, item *entities.Entity) error
	Update(ctx context.Context, item *entities.Entity) error
	Delete(ctx context.Context, id uuid.UUID) (int64, error)
}

type entityRepository struct {
	db *gorm.DB
}

func NewEntityRepository(db *gorm.DB) EntityRepository {
	return &entityRepository{db: db}
}

func (r *entityRepository) FindAll(ctx context.Context, filter dto.GetEntityQuery) ([]entities.Entity, error) {
	db := database.GetDB(ctx, r.db)
	var list []entities.Entity

	query := db.Model(&entities.Entity{}).
		Joins("LEFT JOIN categories ON categories.id = entities.category_id").
		Preload("Category")

	if catName := strings.TrimSpace(filter.Category); catName != "" {
		query = query.Where("LOWER(categories.name) = LOWER(?)", catName)
	}
	if status := strings.TrimSpace(filter.Status); status != "" {
		query = query.Where("entities.status = ?", status)
	}
	if search := strings.TrimSpace(filter.Search); search != "" {
		like := "%" + search + "%"
		query = query.Where("entities.name ILIKE ? OR categories.name ILIKE ?", like, like)
	}

	if err := query.Order("entities.created_at DESC, entities.id DESC").Find(&list).Error; err != nil {
		return nil, err
	}

	return list, nil
}

func (r *entityRepository) FindByID(ctx context.Context, id uuid.UUID) (*entities.Entity, error) {
	db := database.GetDB(ctx, r.db)
	var item entities.Entity
	if err := db.Preload("Category").First(&item, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *entityRepository) Create(ctx context.Context, item *entities.Entity) error {
	db := database.GetDB(ctx, r.db)
	return db.Create(item).Error
}

func (r *entityRepository) Update(ctx context.Context, item *entities.Entity) error {
	db := database.GetDB(ctx, r.db)
	return db.Omit("Category").Save(item).Error
}

func (r *entityRepository) Delete(ctx context.Context, id uuid.UUID) (int64, error) {
	db := database.GetDB(ctx, r.db)
	res := db.Delete(&entities.Entity{}, "id = ?", id)
	return res.RowsAffected, res.Error
}
