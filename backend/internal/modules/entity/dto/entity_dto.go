package dto

import "github.com/google/uuid"

type CreateEntityRequest struct {
	Name      string  `json:"name" validate:"required,min=2,max=100"`
	Category  string  `json:"category" validate:"required,min=2,max=100"`
	Status    string  `json:"status" validate:"required,oneof=Active Inactive Maintenance Offline"`
	Latitude  float64 `json:"latitude" validate:"required,gte=-90,lte=90"`
	Longitude float64 `json:"longitude" validate:"required,gte=-180,lte=180"`
}

type UpdateEntityRequest = CreateEntityRequest

type GetEntityQuery struct {
	Category string `query:"category"`
	Status   string `query:"status"`
	Search   string `query:"search"`
}

type EntityResponse struct {
	ID        uuid.UUID         `json:"id"`
	Name      string            `json:"name"`
	Category  *CategoryResponse `json:"category,omitempty"`
	Status    string            `json:"status"`
	Latitude  float64           `json:"latitude"`
	Longitude float64           `json:"longitude"`
	CreatedAt string            `json:"created_at"`
	UpdatedAt string            `json:"updated_at"`
}
