import Joi from "joi";

export const turnValidation = Joi.object({
  bicicletero: Joi.string()
    .allow("", null)
    .max(10)
    .messages({
      "string.max": "El número de bicicletero no puede exceder los 10 caracteres.",
    }),
  hora_inicio: Joi.string()
    .allow("", null)
    .pattern(/^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "La hora de inicio debe estar en formato HH:MM.",
    }),
  hora_salida: Joi.string()
    .allow("", null)
    .pattern(/^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .messages({
      "string.pattern.base": "La hora de salida debe estar en formato HH:MM.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten campos adicionales",
  });

export const batchTurnsValidation = Joi.object({
  turns: Joi.array()
    .items(
      Joi.object({
        userId: Joi.number()
          .integer()
          .positive()
          .required()
          .messages({
            "number.base": "El ID de usuario debe ser un número.",
            "number.integer": "El ID de usuario debe ser un número entero.",
            "number.positive": "El ID de usuario debe ser positivo.",
            "any.required": "El ID de usuario es obligatorio.",
          }),
        bicicletero: Joi.string()
          .allow("", null)
          .max(10)
          .messages({
            "string.max": "El número de bicicletero no puede exceder los 10 caracteres.",
          }),
        hora_inicio: Joi.string()
          .allow("", null)
          .pattern(/^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .messages({
            "string.pattern.base": "La hora de inicio debe estar en formato HH:MM.",
          }),
        hora_salida: Joi.string()
          .allow("", null)
          .pattern(/^$|^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
          .messages({
            "string.pattern.base": "La hora de salida debe estar en formato HH:MM.",
          }),
      })
    )
    .required()
    .messages({
      "array.base": "El campo 'turns' debe ser un array.",
      "any.required": "El campo 'turns' es obligatorio.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten campos adicionales",
  });
