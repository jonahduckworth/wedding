// Email HTML templates with inline styles for maximum compatibility

/// Invitation email with RSVP link
/// Placeholder design — Jonah will provide the final image/PDF version later
pub fn invitation_email_html(
    guest_names: &str,
    rsvp_link: &str,
    website_url: &str,
) -> String {
    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're Invited - Sam & Jonah's Wedding</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; background-color: #f7f3f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f3f0;">
        <tr>
            <td align="center" style="padding: 30px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 50px 40px 30px; text-align: center; background-color: #faf8f5; border-bottom: 1px solid #e8ddd1;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #a0826d;">You Are Cordially Invited</p>
                            <h1 style="margin: 0; font-size: 36px; color: #4a4a4a; font-weight: 300;">Sam <span style="color: #c9a88a;">&amp;</span> Jonah</h1>
                        </td>
                    </tr>

                    <!-- Placeholder for future image/PDF -->
                    <tr>
                        <td style="padding: 40px; text-align: center; background-color: #fdf9f5; border-bottom: 1px solid #e8ddd1;">
                            <p style="margin: 0; font-size: 13px; color: #b0a090; font-style: italic;">
                                [Invitation design will be placed here]
                            </p>
                        </td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td style="padding: 40px; background-color: #ffffff; color: #4a4a4a;">
                            <p style="margin: 0 0 25px 0; font-size: 17px; line-height: 1.7; color: #6b6b6b; text-align: center;">
                                Dear {guest_names},
                            </p>

                            <p style="margin: 0 0 25px 0; font-size: 17px; line-height: 1.8; color: #6b6b6b; text-align: center;">
                                We joyfully invite you to celebrate our wedding!
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0; background-color: #faf8f5; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 25px; text-align: center;">
                                        <p style="margin: 0 0 8px 0; font-size: 22px; color: #4a4a4a; font-weight: 300;">Saturday, August 15, 2026</p>
                                        <p style="margin: 0; font-size: 16px; color: #8b7355;">Rouge Restaurant • Calgary, Alberta</p>
                                    </td>
                                </tr>
                            </table>

                            <!-- RSVP Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 35px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{rsvp_link}" style="display: inline-block; background-color: #a0826d; color: #ffffff; text-decoration: none; padding: 18px 50px; font-size: 16px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;">
                                            RSVP Now
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0 0; font-size: 14px; color: #999; text-align: center;">
                                Please RSVP by April 30, 2026
                            </p>

                            <p style="margin: 25px 0 0 0; font-size: 16px; line-height: 1.7; color: #8b7355; text-align: center; font-style: italic;">
                                With love,<br>
                                <span style="font-style: normal; letter-spacing: 1px;">Sam &amp; Jonah</span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 25px 40px; background-color: #faf8f5; text-align: center; border-top: 1px solid #e8ddd1;">
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #8b7355;">
                                <a href="{website_url}" style="color: #a0826d; text-decoration: none;">Visit Our Wedding Website</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #b0a090;">
                                If the button doesn't work, copy this link: {rsvp_link}
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>"#,
        guest_names = guest_names,
        rsvp_link = rsvp_link,
        website_url = website_url,
    )
}

pub fn save_the_date_html(
    guest_names: &[String],
    website_url: &str,
    venue_map_url: &str,
    hotel_info_url: &str,
) -> String {
    let names_display = if guest_names.len() == 1 {
        guest_names[0].clone()
    } else {
        format!("{} and {}", guest_names[0], guest_names[1])
    };

    // Hero image URL - update this to your hosted image URL
    let hero_image_url = format!("{}/save-the-date-hero.png", website_url);

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Save the Date - Sam & Jonah</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; background-color: #f7f3f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f3f0;">
        <tr>
            <td align="center" style="padding: 30px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">

                    <!-- Hero Image -->
                    <tr>
                        <td style="padding: 0;">
                            <img src="{}" alt="Sam and Jonah" width="600" style="width: 100%; height: auto; display: block; border: none;" />
                        </td>
                    </tr>

                    <!-- Main content -->
                    <tr>
                        <td style="padding: 40px; background-color: #ffffff; color: #4a4a4a;">
                            <p style="margin: 0 0 30px 0; font-size: 17px; line-height: 1.7; color: #6b6b6b; text-align: center; background-color: transparent;">
                                Dear {},
                            </p>

                            <p style="margin: 0 0 40px 0; font-size: 17px; line-height: 1.8; color: #6b6b6b; text-align: center; background-color: transparent;">
                                We're getting married and would love for you to celebrate with us!
                            </p>

                            <!-- Action Links -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 40px 0;">
                                <tr>
                                    <td align="center" style="padding: 0 0 15px 0;">
                                        <a href="{}" style="display: inline-block; background-color: #a0826d; color: #ffffff; text-decoration: none; padding: 16px 40px; font-size: 15px; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; min-width: 200px; text-align: center;">
                                            View Venue
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 0;">
                                        <a href="{}" style="display: inline-block; background-color: #c9a88a; color: #ffffff; text-decoration: none; padding: 16px 40px; font-size: 15px; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; min-width: 200px; text-align: center;">
                                            Hotel Information
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 40px 0 0 0; font-size: 16px; line-height: 1.7; color: #6b6b6b; text-align: center; background-color: transparent;">
                                Formal invitation with RSVP details to follow.
                            </p>

                            <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.7; color: #8b7355; text-align: center; font-style: italic; background-color: transparent;">
                                With love,<br>
                                <span style="font-weight: 400; font-style: normal; letter-spacing: 1px; background-color: transparent;">Sam & Jonah</span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 35px 40px; background-color: #faf8f5; text-align: center; border-top: 1px solid #e8ddd1;">
                            <p style="margin: 0; font-size: 14px; color: #8b7355; letter-spacing: 0.5px; background-color: transparent;">
                                August 15, 2026 • Rouge, Calgary, Alberta
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>"#,
        hero_image_url,
        names_display,
        venue_map_url,
        hotel_info_url
    )
}
