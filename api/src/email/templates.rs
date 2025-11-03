// Email HTML templates with inline styles for maximum compatibility

pub fn save_the_date_html(
    guest_names: &[String],
    website_url: &str,
    venue_map_url: &str,
    hotel_info_url: &str,
    tracking_pixel_url: &str,
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
                        <td style="padding: 40px; color: #4a4a4a;">
                            <p style="margin: 0 0 30px 0; font-size: 17px; line-height: 1.7; color: #6b6b6b; text-align: center;">
                                Dear {},
                            </p>

                            <p style="margin: 0 0 40px 0; font-size: 17px; line-height: 1.8; color: #6b6b6b; text-align: center;">
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

                            <p style="margin: 40px 0 0 0; font-size: 16px; line-height: 1.7; color: #6b6b6b; text-align: center;">
                                Formal invitation with RSVP details to follow.
                            </p>

                            <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.7; color: #8b7355; text-align: center; font-style: italic;">
                                With love,<br>
                                <span style="font-weight: 400; font-style: normal; letter-spacing: 1px;">Sam & Jonah</span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 35px 40px; background-color: #f7f3f0; text-align: center; border-top: 1px solid #e8ddd1;">
                            <p style="margin: 0; font-size: 14px; color: #999999; letter-spacing: 0.5px;">
                                August 15, 2026 • Rouge, Calgary, Alberta
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
        hero_image_url,
        names_display,
        venue_map_url,
        hotel_info_url,
        tracking_pixel_url
    )
}
