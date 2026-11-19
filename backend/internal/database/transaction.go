package database

import (
	"context"

	"gorm.io/gorm"
)

type contextKey string

const txKey contextKey = "TxKey"

type TransactionManager interface {
	Execute(ctx context.Context, fn func(ctx context.Context) error) error
}

type transactionManager struct {
	db *gorm.DB
}

func NewTransactionManager(db *gorm.DB) TransactionManager {
	return &transactionManager{db: db}
}

func (t *transactionManager) Execute(ctx context.Context, fn func(ctx context.Context) error) error {
	return t.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Inject *gorm.DB transaksi ke dalam context
		txCtx := context.WithValue(ctx, txKey, tx)
		return fn(txCtx)
	})
}

func GetDB(ctx context.Context, defaultDB *gorm.DB) *gorm.DB {
	if tx, ok := ctx.Value(txKey).(*gorm.DB); ok && tx != nil {
		return tx
	}
	return defaultDB.WithContext(ctx)
}
