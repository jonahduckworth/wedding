// Email HTML templates with inline styles for maximum compatibility

pub fn save_the_date_html(
    guest_names: &[String],
    wedding_date: &str,
    venue: &str,
    website_url: &str,
    tracking_pixel_url: &str,
) -> String {
    let names_display = if guest_names.len() == 1 {
        guest_names[0].clone()
    } else {
        format!("{} and {}", guest_names[0], guest_names[1])
    };

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Save the Date - Sam & Jonah</title>
</head>
<body style="margin: 0; padding: 0; font-family: Georgia, 'Times New Roman', serif; background-color: #f5f5f5;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

                    <!-- Header with wedding colors -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #c4d7a4 0%, #7d9456 100%); padding: 60px 40px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: normal; letter-spacing: 2px; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                Save the Date
                            </h1>
                        </td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td style="padding: 50px 40px; color: #333333;">
                            <p style="margin: 0 0 30px 0; font-size: 18px; line-height: 1.6; color: #555555;">
                                Dear <strong>{}</strong>,
                            </p>

                            <p style="margin: 0 0 30px 0; font-size: 18px; line-height: 1.8; color: #555555;">
                                We're getting married and would love for you to celebrate with us!
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0; background-color: #ecd5e8; border-radius: 8px; padding: 30px;">
                                <tr>
                                    <td align="center">
                                        <h2 style="margin: 0 0 20px 0; color: #9a4e72; font-size: 36px; font-weight: normal;">
                                            Sam & Jonah
                                        </h2>
                                        <p style="margin: 0; font-size: 22px; color: #c78ba4; font-weight: bold;">
                                            {}
                                        </p>
                                        <p style="margin: 15px 0 0 0; font-size: 18px; color: #9a4e72;">
                                            {}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0; font-size: 16px; line-height: 1.6; color: #555555;">
                                Formal invitation with RSVP details to follow. In the meantime, please mark your calendars and visit our website for more information.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{}" style="display: inline-block; background-color: #9a4e72; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(154, 78, 114, 0.3);">
                                            Visit Our Website
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.6; color: #555555; text-align: center;">
                                We can't wait to celebrate with you!
                            </p>

                            <p style="margin: 20px 0 0 0; font-size: 16px; line-height: 1.6; color: #555555; text-align: center; font-style: italic;">
                                With love,<br>
                                <strong style="color: #9a4e72;">Sam & Jonah</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9f9f9; border-radius: 0 0 12px 12px; text-align: center;">
                            <p style="margin: 0; font-size: 14px; color: #999999;">
                                August 15, 2026 • Rouge, Calgary, Alberta
                            </p>
                            <p style="margin: 10px 0 0 0; font-size: 12px; color: #999999;">
                                <a href="{}" style="color: #9a4e72; text-decoration: none;">samandjonah.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>

    <!-- Tracking pixel -->
    <img src="{}" width="1" height="1" alt="" style="display:block;" />
</body>
</html>"#,
        names_display,
        wedding_date,
        venue,
        website_url,
        website_url,
        tracking_pixel_url
    )
}
