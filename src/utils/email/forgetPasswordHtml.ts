
export const forgetPwdEmailBuilder = (url: string) => {
    return (
        `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="background:#2563eb; padding:30px;">
              <h1 style="margin:0; color:#ffffff;">Sham Finance Dashboard</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px; color:#333333;">

              <h2 style="margin-top:0;">Reset Your Password</h2>

              <p style="font-size:16px; line-height:1.6;">
                We received a request to reset the password for your account.
              </p>

              <p style="font-size:16px; line-height:1.6;">
                Click the button below to create a new password. This link will expire in
                <strong>15 minutes</strong>.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td align="center" bgcolor="#2563eb" style="border-radius:6px;">
                    <a href=${url}
                       style="display:inline-block;
                              padding:14px 28px;
                              color:#ffffff;
                              text-decoration:none;
                              font-size:16px;
                              font-weight:bold;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:15px; line-height:1.6;">
                If the button doesn't work, copy and paste the following link into your browser:
              </p>

              <p style="word-break:break-all;">
                <a href=${url} style="color:#2563eb;">
                  ${url}
                </a>
              </p>

              <hr style="border:none; border-top:1px solid #eeeeee; margin:30px 0;">

              <p style="font-size:14px; color:#666666; line-height:1.6;">
                If you didn't request a password reset, you can safely ignore this email.
                Your password will remain unchanged.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px; background:#f9fafb; color:#888888; font-size:13px;">
              © 2026 Sham Finance Dashboard. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`
    )
}