package dto

import "github.com/google/uuid"

type CreateOrFindCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=100"`
}

type CategoryResponse struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}
