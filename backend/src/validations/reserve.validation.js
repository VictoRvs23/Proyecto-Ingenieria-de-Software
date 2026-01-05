"use strict";
import Joi from "joi";

export const createReserveValidation = Joi.object({
  bike_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      "any.required": "El ID de la bicicleta es obligatorio",
      "number.base": "El ID de la bicicleta debe ser un número",
      "number.positive": "El ID de la bicicleta debe ser positivo",
    }),
  bicicletero_number: Joi.number()
    .integer()
    .min(1)
    .max(4)
    .required()
    .messages({
      "any.required": "El número de bicicletero es obligatorio",
      "number.base": "El bicicletero debe ser un número",
      "number.min": "El bicicletero debe ser al menos 1",
      "number.max": "El bicicletero debe ser máximo 4"
    }),
    space: Joi.number()
    .integer()
    .min(1)
    .max(15) 
    .optional() 
    .messages({
      "number.base": "El espacio debe ser un número",
      "number.min": "El espacio debe ser al menos 1",
      "number.max": "El espacio no puede ser mayor a 15"
    }),
  foto_url: Joi.string().uri().optional().messages({
    "string.uri": "La URL de la foto debe ser válida"
  }),
  doc_url: Joi.string().uri().optional().allow('',null).messages({
    "string.uri": "La URL del documento debe ser válida"
  })

});


export const updateReserveValidation = Joi.object({
  estado: Joi.string()
    .valid("solicitada","ingresada", "entregada", "cancelada")
    .required()
    .messages({
      "any.only": "El estado debe ser uno de: ingresada, entregada, cancelada",
      "any.required": "El campo 'estado' es obligatorio",
    }),
    space: Joi.number() 
    .integer()
    .min(1)
    .max(15)
    .optional()
    .messages({
      "number.base": "El espacio debe ser un número",
      "number.min": "El espacio debe ser al menos 1",
      "number.max": "El espacio no puede ser mayor a 15"
  }),
  nota: Joi.string()
        .min(0)
        .max(500)
        .optional()
        .allow("") 
        .messages({
            "string.base": "La nota debe ser texto",
            "string.max": "La nota es muy larga"
    }),
  foto_url: Joi.string().uri().optional().messages({
    "string.uri": "La URL de la foto debe ser válida"
  }),
  doc_url: Joi.string().uri().optional().messages({
    "string.uri": "La URL del documento debe ser válida"
  })
});

export const tokenValidation = Joi.object({
  token: Joi.number()
    .integer()
    .min(1000)
    .max(9999)
    .required()
    .messages({
      "number.base": "El token debe ser un número de 4 dígitos",
      "number.min": "El token debe tener al menos 4 dígitos",
      "number.max": "El token debe tener como máximo 4 dígitos",
      "any.required": "El token es obligatorio",
    }),
});

export const reserveParamsValidation = Joi.object({
  token: Joi.number()
    .integer()
    .min(1000)
    .max(9999)
    .required()
    .messages({
      "number.base": "El token debe ser un número de 4 dígitos",
      "number.min": "El token debe tener al menos 4 dígitos", 
      "number.max": "El token debe tener como máximo 4 dígitos",
      "any.required": "El token es obligatorio",
    }),
});

export const reserveQueryValidation = Joi.object({
  estado: Joi.string()
    .valid("ingresada", "entregada", "cancelada")
    .optional()
    .messages({
      "any.only": "El estado debe ser uno de: ingresada, entregada, cancelada"
    }),
  user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "El ID de usuario debe ser un número",
      "number.positive": "El ID de usuario debe ser positivo",
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
});