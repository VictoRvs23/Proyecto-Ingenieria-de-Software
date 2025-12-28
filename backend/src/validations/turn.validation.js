import Joi from "joi";

export const turnValidation = Joi.object({
  bicicletero: Joi.string()
    .allow("", null)
    .max(10)
    .messages({
      "string.max": "El número de bicicletero no puede exceder los 10 caracteres.",
    }),
  jornada: Joi.string()
    .allow("", null)
    .valid("Mañana", "Tarde", "")
    .messages({
      "any.only": "La jornada debe ser 'Mañana' o 'Tarde'.",
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
        jornada: Joi.string()
          .allow("", null)
          .valid("Mañana", "Tarde", "")
          .messages({
            "any.only": "La jornada debe ser 'Mañana' o 'Tarde'.",
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
