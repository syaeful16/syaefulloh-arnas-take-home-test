package dto

type CreateOrFindCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=100"`
}
