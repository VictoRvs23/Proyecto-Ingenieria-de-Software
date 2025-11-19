"use strict";
import Joi from "joi";

export const spaceValidation = Joi.object({
    space: Joi.number()
        .integer()
        .min(0)
        .max(15)
        .required()
        .messages({
            "number.base": "El espacio disponible debe ser un número entero.",
            "number.min": "El espacio disponible no puede ser negativo.",
            "numer.max": "El espacio disponible no puede exceder 15.",
            "any.required": "El espacio disponible es obligatorio."
        }),
    })
    .unknown(false)
    .messages({
        "object.unknown": "No se permiten campos adicionales",
      });

export const bikeEntryValidation = Joi.object({
    model: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.base": "El modelo de la bicicleta debe ser una cadena de texto.",
            "string.min": "El modelo de la bicicleta debe tener al menos 2 caracteres.",
            "string.max": "El modelo de la bicicleta no puede exceder 50 caracteres.",
            "any.required": "El modelo de la bicicleta es obligatorio."
        }),
    color: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
            "string.base": "El color de la bicicleta debe ser una cadena de texto.",
            "string.min": "El color de la bicicleta debe tener al menos 3 caracteres.",
            "string.max": "El color de la bicicleta no puede exceder 30 caracteres.",
            "any.required": "El color de la bicicleta es obligatorio."
        }),
    owner: Joi.string()
            .min(5)
            .max(100)
            .required()
            .messages({
                "string.empty": "El nombre del propietario no puede estar vacío.",
                "any.required": "El nombre del propietario es obligatorio.",
                "string.base": "El nombre del propietario debe ser de tipo texto.",
                "string.min": "El nombre del propietario debe tener al menos 5 caracteres.",
                "string.max": "El nombre del propietario debe tener como máximo 100 caracteres.",
            }),
    })
    .unknown(false)
    .messages({
        "object.unknown": "No se permiten campos adicionales",
      });