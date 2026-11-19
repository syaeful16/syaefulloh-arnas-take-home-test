package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/dto"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/services"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/response"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
)

type CategoryHandler struct {
	categoryService services.CategoryService
	validator       *validator.Validator
}

func NewCategoryHandler(categoryService services.CategoryService, v *validator.Validator) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
		validator:       v,
	}
}

func (h *CategoryHandler) GetAllCategories(c *fiber.Ctx) error {
	categories, err := h.categoryService.FindAll(c.UserContext())
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Gagal mengambil data kategori.")
	}

	var categoriesResponse []dto.CategoryResponse
	for _, category := range categories {
		categoriesResponse = append(categoriesResponse, dto.CategoryResponse{
			ID:   category.ID,
			Name: category.Name,
		})
	}

	return response.Success(c, fiber.StatusOK, "CATEGORIES_FOUND", "Data kategori berhasil ditemukan.", categoriesResponse)
}
