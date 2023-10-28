import { IEmailContact } from "../../interfaces/IEmail";
import * as logger from "firebase-functions/logger";

export const addContact = async (contact: IEmailContact) => {
  try {
    await fetch("https://api.brevo.com/v3/contacts", {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "api-key":
          "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",
      },
      method: "POST",
      body: JSON.stringify(contact),
    });
  } catch (e) {
    logger.error("Error adding contact", e);
  }
};

export const updateContact = async (contact: IEmailContact) => {
  try {
    await fetch(`https://api.brevo.com/v3/contacts/${contact.email}`, {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "api-key":
          "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",
      },
      method: "PUT",
      body: JSON.stringify(contact),
    });
  } catch (e) {
    logger.error("Error updating contact", e);
  }
};

export const deleteContact = async (email: string) => {
  try {
    await fetch(`https://api.brevo.com/v3/contacts/${email}`, {
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json",
        "api-key":
          "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",
      },
      method: "DELETE",
    });
  } catch (e) {
    logger.error("Error updating contact", e);
  }
};
