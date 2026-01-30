"use server";

import { Resend } from "resend";
import React from "react";
import { render } from "@react-email/render";

interface sendEmailInterface {
  to: string;
  subject: string;
  react: React.ReactElement | undefined;
}

export async function sendEmail(obj: sendEmailInterface) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // console.error("RESEND_API_KEY is not set in environment variables");
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  const resend = new Resend(apiKey);

  try {
    // console.log(
    //   `Attempting to send email to ${obj.to} with subject: ${obj.subject}`,
    // );

    const htmlContent = await render(obj.react);

    const data = await resend.emails.send({
      from: "Expense Tracker <onboarding@resend.dev>",
      to: obj.to,
      subject: obj.subject,
      html: htmlContent,
    });

    // console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    // console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
