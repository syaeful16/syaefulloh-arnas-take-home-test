package handlers

import (
	"errors"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/dto"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/entities"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/modules/entity/services"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/response"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
)

type EntityHandler struct {
	entityService services.EntityService
	validator     *validator.Validator
}

func NewEntityHandler(entityService services.EntityService, v *validator.Validator) *EntityHandler {
	return &EntityHandler{
		entityService: entityService,
		validator:     v,
	}
}

func toEntityResponse(item *entities.Entity) dto.EntityResponse {
	var catResp *dto.CategoryResponse
	if item.Category != nil {
		catResp = &dto.CategoryResponse{
			ID:   item.Category.ID,
			Name: item.Category.Name,
		}
	}

	return dto.EntityResponse{
		ID:        item.ID,
		Name:      item.Name,
		Category:  catResp,
		Status:    item.Status,
		Latitude:  item.Latitude,
		Longitude: item.Longitude,
		CreatedAt: item.CreatedAt.Format(time.RFC3339),
		UpdatedAt: item.UpdatedAt.Format(time.RFC3339),
	}
}

func (h *EntityHandler) GetAllEntities(c *fiber.Ctx) error {
	var filter dto.GetEntityQuery
	if err := c.QueryParser(&filter); err != nil {
		return response.Error(c, fiber.StatusUnprocessableEntity, "INVALID_QUERY", "Format query tidak valid.")
	}

	items, err := h.entityService.FindAll(c.UserContext(), filter)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Gagal mengambil data entitas.")
	}

	res := make([]dto.EntityResponse, 0, len(items))
	for i := range items {
		res = append(res, toEntityResponse(&items[i]))
	}

	return response.Success(c, fiber.StatusOK, "ENTITIES_FOUND", "Data entitas berhasil ditemukan.", res)
}

func (h *EntityHandler) GetEntityByID(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID entitas tidak valid.")
	}

	item, err := h.entityService.FindByID(c.UserContext(), id)
	if err != nil {
		if errors.Is(err, services.ErrEntityNotFound) {
			return response.Error(c, fiber.StatusNotFound, "ENTITY_NOT_FOUND", "Entitas tidak ditemukan.")
		}
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Gagal mengambil detail entitas.")
	}

	return response.Success(c, fiber.StatusOK, "ENTITY_FOUND", "Detail entitas berhasil ditemukan.", toEntityResponse(item))
}

func (h *EntityHandler) CreateEntity(c *fiber.Ctx) error {
	var req dto.CreateEntityRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusUnprocessableEntity, "INVALID_BODY", "Format payload request tidak valid.")
	}

	if validationErrs := h.validator.ValidateStruct(req); len(validationErrs) > 0 {
		return response.Validation(c, validationErrs)
	}

	item, err := h.entityService.Create(c.UserContext(), req)
	if err != nil {
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Gagal membuat entitas.")
	}

	return response.Success(c, fiber.StatusCreated, "ENTITY_CREATED", "Entitas berhasil dibuat.", toEntityResponse(item))
}

func (h *EntityHandler) UpdateEntity(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID entitas tidak valid.")
	}

	var req dto.UpdateEntityRequest
	if err := c.BodyParser(&req); err != nil {
		return response.Error(c, fiber.StatusUnprocessableEntity, "INVALID_BODY", "Format payload request tidak valid.")
	}

	if validationErrs := h.validator.ValidateStruct(req); len(validationErrs) > 0 {
		return response.Validation(c, validationErrs)
	}

	item, err := h.entityService.Update(c.UserContext(), id, req)
	if err != nil {
		if errors.Is(err, services.ErrEntityNotFound) {
			return response.Error(c, fiber.StatusNotFound, "ENTITY_NOT_FOUND", "Entitas tidak ditemukan.")
		}
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Gagal memperbarui entitas.")
	}

	return response.Success(c, fiber.StatusOK, "ENTITY_UPDATED", "Entitas berhasil diperbarui.", toEntityResponse(item))
}

func (h *EntityHandler) DeleteEntity(c *fiber.Ctx) error {
	id, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return response.Error(c, fiber.StatusBadRequest, "INVALID_ID", "ID entitas tidak valid.")
	}

	if err := h.entityService.Delete(c.UserContext(), id); err != nil {
		if errors.Is(err, services.ErrEntityNotFound) {
			return response.Error(c, fiber.StatusNotFound, "ENTITY_NOT_FOUND", "Entitas tidak ditemukan.")
		}
		return response.Error(c, fiber.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Gagal menghapus entitas.")
	}

	return response.Success(c, fiber.StatusOK, "ENTITY_DELETED", "Entitas berhasil dihapus.", nil)
}
