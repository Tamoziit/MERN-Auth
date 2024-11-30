import { 
    PASSWORD_RESET_REQUEST_TEMPLATE, 
    PASSWORD_RESET_SUCCESS_TEMPLATE, 
    VERIFICATION_EMAIL_TEMPLATE
} from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        });

        console.log("Email sent successfully", response);
    } catch (error) {
        console.log(`Error in sending verification email: ${error}`);
        throw new Error(`Error in sending verification email: ${error}`);
    }
}

export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "7d821ee8-11cf-4bdb-bd52-b3938a2efd72",
            template_variables: {
                "name": name,
                "company_info_name": "MERN Auth"
            }
        });

        console.log("Welcome Email sent successfully", response);
    } catch (error) {
        console.log(`Error in sending welcome email: ${error}`);
        throw new Error(`Error in sending welcome email: ${error}`);
    }
}

export const sendPasswordResetEmail = async (email, resetUrl) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset Password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "Password Reset"
        });

        console.log("Reset Passwword Email sent successfully", response);
    } catch (error) {
        console.log(`Error in sending reset password request email: ${error}`);
        throw new Error(`Error in sending reset password request email: ${error}`);
    }
}

export const sendResetSuccessEmail = async (email) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset Password Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset Success"
        });

        console.log("Reset Passwword Success Email sent successfully", response);
    } catch (error) {
        console.log(`Error in sending reset password success email: ${error}`);
        throw new Error(`Error in sending reset password success email: ${error}`);
    }
}