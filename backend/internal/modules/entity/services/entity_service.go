package services

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/dto"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/repositories"
	"gorm.io/gorm"
)

var (
	ErrEntityNotFound = errors.New("ENTITY_NOT_FOUND")
)

type EntityService interface {
	FindAll(ctx context.Context, filter dto.GetEntityQuery) ([]entities.Entity, error)
	FindByID(ctx context.Context, id uuid.UUID) (*entities.Entity, error)
	Create(ctx context.Context, req dto.CreateEntityRequest) (*entities.Entity, error)
	Update(ctx context.Context, id uuid.UUID, req dto.UpdateEntityRequest) (*entities.Entity, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type entityService struct {
	repo            repositories.EntityRepository
	categoryService CategoryService
	txManager       database.TransactionManager
}

func NewEntityService(
	repo repositories.EntityRepository,
	categoryService CategoryService,
	txManager database.TransactionManager,
) EntityService {
	return &entityService{
		repo:            repo,
		categoryService: categoryService,
		txManager:       txManager,
	}
}

func (s *entityService) FindAll(ctx context.Context, filter dto.GetEntityQuery) ([]entities.Entity, error) {
	return s.repo.FindAll(ctx, filter)
}

func (s *entityService) FindByID(ctx context.Context, id uuid.UUID) (*entities.Entity, error) {
	item, err := s.repo.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrEntityNotFound
		}
		return nil, err
	}
	return item, nil
}

func (s *entityService) Create(ctx context.Context, req dto.CreateEntityRequest) (*entities.Entity, error) {
	var created *entities.Entity

	err := s.txManager.Execute(ctx, func(txCtx context.Context) error {
		cat, err := s.categoryService.FindOrCreate(txCtx, req.Category)
		if err != nil {
			return err
		}

		item := &entities.Entity{
			ID:         uuid.New(),
			Name:       strings.TrimSpace(req.Name),
			CategoryID: cat.ID,
			Status:     req.Status,
			Latitude:   req.Latitude,
			Longitude:  req.Longitude,
		}

		if err := s.repo.Create(txCtx, item); err != nil {
			return err
		}

		item.Category = cat
		created = item
		return nil
	})
	if err != nil {
		return nil, err
	}

	return created, nil
}

func (s *entityService) Update(ctx context.Context, id uuid.UUID, req dto.UpdateEntityRequest) (*entities.Entity, error) {
	var updated *entities.Entity

	err := s.txManager.Execute(ctx, func(txCtx context.Context) error {
		item, err := s.repo.FindByID(txCtx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return ErrEntityNotFound
			}
			return err
		}

		cat, err := s.categoryService.FindOrCreate(txCtx, req.Category)
		if err != nil {
			return err
		}

		item.Name = strings.TrimSpace(req.Name)
		item.CategoryID = cat.ID
		item.Status = req.Status
		item.Latitude = req.Latitude
		item.Longitude = req.Longitude

		if err := s.repo.Update(txCtx, item); err != nil {
			return err
		}

		item.Category = cat
		updated = item
		return nil
	})
	if err != nil {
		return nil, err
	}

	return updated, nil
}

func (s *entityService) Delete(ctx context.Context, id uuid.UUID) error {
	rows, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrEntityNotFound
	}
	return nil
}
