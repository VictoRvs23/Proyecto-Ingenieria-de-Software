"use strict";
import Joi from "joi";

// Validación para crear un reporte
export const createReportValidation = Joi.object({
    description: Joi.string()
        .min(5)
        .max(500)
        .required()
        .messages({
            "string.empty": "La descripción no puede estar vacía.",
            "string.min": "La descripción debe tener al menos 5 caracteres.",
            "any.required": "La descripción es obligatoria.",
    }),
    bike_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            "number.base": "El ID de la bicicleta debe ser un número.",
            "any.required": "El ID de la bicicleta es obligatorio.",
    }),
})
    .unknown(false);

// Validación para actualizar estado (solo admins/bicicleteros)
export const updateReportStatusValidation = Joi.object({
    status: Joi.string()
    .valid("pending", "in_progress", "resolved", "discarded")
    .required()
    .messages({
    "any.only": "El estado debe ser: pending, in_progress, resolved o discarded",
    }),
});