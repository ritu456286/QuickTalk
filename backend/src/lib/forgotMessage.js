export const forgotMessage = (resetUrl, user) => {
    return `
        <body style="margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f7f7; color: #444444;">
            <table align="center" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; padding: 20px; border: 1px solid #dddddd;">
                <tr>
                    <td align="center" style="padding-bottom: 20px;">
                        <h2 style="color: #444444; font-size: 24px;">Reset Your Password</h2>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px 20px; font-size: 16px; line-height: 1.5; color: #444444;">
                        <p>Hello ${user.fullName},</p>
                        <p>Tap the button below to reset your account password. If you didn't request a new password, you can safely ignore this email.</p>
                        <p style="text-align: center; margin: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 12px 20px; color: #ffffff; background-color: #007bff; text-decoration: none; font-weight: bold; text-transform: uppercase; border-radius: 5px;">Reset Password</a>
                        </p>
                        <p>If the button doesn't work, copy and paste the following link into your browser:</p>
                        <p style="word-wrap: break-word;">
                            <a href="${resetUrl}" style="color: #007bff;">${resetUrl}</a>
                        </p>
                        <p>Thank you,</p>
                        <p><strong>Chatty Team</strong></p>
                    </td>
                </tr>
            </table>
        </body>
    `;
}
