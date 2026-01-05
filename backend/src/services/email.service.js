"use strict";
import nodemailer from "nodemailer";
import { EMAIL_USER, EMAIL_PASS } from "../config/configEnv.js";

// Creamos el transporte
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * IMPORTANTE: Debe decir "export const sendEmail" 
 * para que otros archivos puedan verla.
 */
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"Sistema Bicicletero UBB" <${EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado correctamente: " + info.messageId);
    return info;
  } catch (error) {
    console.error("Error en el servicio de email:", error);
    return null;
  }
};