package services

import (
	"context"
	"errors"
	"strings"

	"github.com/google/uuid"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/database"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/repositories"
)

var (
	ErrCategoryNotFound = errors.New("CATEGORY_NOT_FOUND")
)

type CategoryService interface {
	FindAll(ctx context.Context) ([]entities.Category, error)
	FindOrCreate(ctx context.Context, name string) (*entities.Category, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type categoryService struct {
	repo      repositories.CategoryRepository
	txManager database.TransactionManager
}

func NewCategoryService(repo repositories.CategoryRepository, txManager database.TransactionManager) CategoryService {
	return &categoryService{
		repo:      repo,
		txManager: txManager,
	}
}

func (s *categoryService) FindAll(ctx context.Context) ([]entities.Category, error) {
	return s.repo.FindAll(ctx)
}

func (s *categoryService) FindOrCreate(ctx context.Context, name string) (*entities.Category, error) {
	nameTrimmed := strings.TrimSpace(name)

	var result *entities.Category
	err := s.txManager.Execute(ctx, func(txCtx context.Context) error {
		newCat := &entities.Category{
			ID:   uuid.New(),
			Name: nameTrimmed,
		}

		cat, err := s.repo.FindOrCreateByName(txCtx, newCat)
		if err != nil {
			return err
		}

		result = cat
		return nil
	})
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (s *categoryService) Delete(ctx context.Context, id uuid.UUID) error {
	rows, err := s.repo.Delete(ctx, id)
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrCategoryNotFound
	}
	return nil
}
