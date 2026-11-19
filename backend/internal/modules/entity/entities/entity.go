package entities

import (
	"time"

	"github.com/google/uuid"
)

type Entity struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	Name       string    `json:"name" gorm:"type:varchar(100);not null"`
	CategoryID uuid.UUID `json:"category_id" gorm:"type:uuid;index;not null"`
	Status     string    `json:"status" gorm:"type:varchar(50);not null;index"`
	Latitude   float64   `json:"latitude" gorm:"type:double precision;not null"`
	Longitude  float64   `json:"longitude" gorm:"type:double precision;not null"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Category *Category `json:"category,omitempty" gorm:"foreignKey:CategoryID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`
}

func (e *Entity) BeforeCreate() error {
	e.ID = uuid.New()

	return nil
}
