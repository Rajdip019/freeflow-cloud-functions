import { IEmail } from "../interfaces/IEmail";
import * as logger from "firebase-functions/logger";

export const sendEmail = async (data : IEmail) => {
  try {
    await fetch("https://api.brevo.com/v3/smtp/email", {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "api-key":
          "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",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (e) {
    logger.error("Error sending email", e);
  }
};
