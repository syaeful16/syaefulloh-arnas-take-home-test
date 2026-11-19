package entities

import (
	"time"

	"github.com/google/uuid"
)

type Category struct {
	ID   uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name string    `gorm:"type:varchar(100);uniqueIndex;not null"`
	CreatedAt time.Time
}
