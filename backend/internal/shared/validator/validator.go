package validator

import (
	"fmt"
	"reflect"
	"strings"

	playground "github.com/go-playground/validator/v10"
)

type ValidationError struct {
	Field   string `json:"field"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func (e ValidationError) Error() string {
	return e.Message
}

type Validator struct {
	validate *playground.Validate
}

func NewValidator() *Validator {
	v := playground.New()

	// Membaca nama field dari tag json jika ada
	v.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "-" {
			return ""
		}
		return name
	})

	return &Validator{validate: v}
}

// Map error dari go-playground/validator ke ValidationError
func (v *Validator) mapValidationError(customFieldName string, err playground.FieldError) ValidationError {
	field := customFieldName
	if field == "" {
		field = strings.ToLower(err.Field())
	}

	switch err.Tag() {
	case "required":
		return ValidationError{
			Field:   field,
			Code:    "REQUIRED",
			Message: fmt.Sprintf("%s is required", field),
		}
	case "email":
		return ValidationError{
			Field:   field,
			Code:    "INVALID_EMAIL",
			Message: "Invalid email format",
		}
	case "min":
		return ValidationError{
			Field:   field,
			Code:    "MIN_LENGTH",
			Message: fmt.Sprintf("%s must be at least %s characters", field, err.Param()),
		}
	case "max":
		return ValidationError{
			Field:   field,
			Code:    "MAX_LENGTH",
			Message: fmt.Sprintf("%s must not exceed %s characters", field, err.Param()),
		}
	case "eqfield":
		return ValidationError{
			Field:   field,
			Code:    "FIELDS_NOT_MATCH",
			Message: fmt.Sprintf("%s does not match %s", field, strings.ToLower(err.Param())),
		}
	case "uuid4":
		return ValidationError{
			Field:   field,
			Code:    "INVALID_UUID",
			Message: fmt.Sprintf("%s contains an invalid UUID format", field),
		}
	}

	return ValidationError{
		Field:   field,
		Code:    "INVALID_FORMAT",
		Message: fmt.Sprintf("%s has invalid format", field),
	}
}

// ValidateVar memvalidasi single value/variable berdasarkan tag (cocok untuk Charm Huh CLI)
func (v *Validator) ValidateVar(fieldLabel string, value interface{}, tag string) error {
	err := v.validate.Var(value, tag)
	if err == nil {
		return nil
	}

	if fieldErrs, ok := err.(playground.ValidationErrors); ok && len(fieldErrs) > 0 {
		mapped := v.mapValidationError(fieldLabel, fieldErrs[0])
		return fmt.Errorf(mapped.Message)
	}

	return err
}

// ValidateStruct memvalidasi seluruh field struct dan mengembalikan list ValidationError
func (v *Validator) ValidateStruct(s interface{}) []ValidationError {
	var errs []ValidationError

	err := v.validate.Struct(s)
	if err == nil {
		return nil
	}

	if fieldErrs, ok := err.(playground.ValidationErrors); ok {
		for _, fieldErr := range fieldErrs {
			// customFieldName dikosongkan agar otomatis memakai nama dari tag json
			errs = append(errs, v.mapValidationError("", fieldErr))
		}
	}

	return errs
}
