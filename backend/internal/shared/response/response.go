package response

import (
	"github.com/gofiber/fiber/v2"
	"github.com/syaeful16/syaefulloh-arnas-take-home-test/backend/internal/shared/validator"
)

func Error(c *fiber.Ctx, status int, code, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"status":  "error",
		"code":    code,
		"message": message,
	})
}

func Success(c *fiber.Ctx, status int, code, message string, data any) error {
	payload := fiber.Map{
		"status":  "success",
		"message": message,
	}
	if code != "" {
		payload["code"] = code
	}
	if data != nil {
		payload["data"] = data
	}
	return c.Status(status).JSON(payload)
}

func Validation(c *fiber.Ctx, errs []validator.ValidationError) error {
	return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
		"status":  "error",
		"code":    "VALIDATION_ERROR",
		"message": "Data request tidak valid",
		"errors":  errs,
	})
}
