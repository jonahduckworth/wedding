// Email HTML templates with inline styles for maximum compatibility

/// Invitation email with RSVP link
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
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
        :root {{ color-scheme: light; supported-color-schemes: light; }}
        @media only screen and (max-width: 620px) {{
            .outer-table {{ width: 100% !important; }}
            .inner-table {{ width: 100% !important; }}
            .invitation-img {{ width: 100% !important; max-width: 100% !important; }}
            .content-pad {{ padding: 30px 20px !important; }}
        }}
        @media (prefers-color-scheme: dark) {{
            .email-bg {{ background-color: #f7f3f0 !important; }}
            .email-body {{ background-color: #ffffff !important; color: #4a4a4a !important; }}
            .btn-rsvp {{ background-color: #7d2248 !important; color: #ffffff !important; }}
        }}
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; background-color: #f7f3f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f3f0;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" class="inner-table" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 25px 20px 15px; text-align: center; background-color: #faf8f5;">
                            <p style="margin: 0; font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #7d2248;">Wedding Invitation</p>
                        </td>
                    </tr>

                    <!-- Invitation Image -->
                    <tr>
                        <td style="padding: 0; text-align: center; font-size: 0; line-height: 0;">
                            <img src="{website_url}/invitation.jpg" class="invitation-img" alt="Samantha Orr and Jonah Duckworth invite you to share in the joy of their wedding — Saturday, August 15, 2026 at four o'clock in the afternoon — Rouge, 1240 8 Ave SE, Calgary, Alberta — Reception to follow — Please RSVP by April 30th 2026" width="600" style="width: 100%; max-width: 600px; height: auto; display: block; border: none; outline: none;" />
                        </td>
                    </tr>

                    <!-- RSVP & Details -->
                    <tr>
                        <td class="content-pad" style="padding: 40px; background-color: #ffffff; color: #4a4a4a;">
                            <p style="margin: 0 0 25px 0; font-size: 17px; line-height: 1.7; color: #6b6b6b; text-align: center;">
                                Dear {guest_names},
                            </p>

                            <p style="margin: 0 0 30px 0; font-size: 17px; line-height: 1.8; color: #6b6b6b; text-align: center;">
                                Please use the button below to RSVP for our special day.
                            </p>

                            <!-- RSVP Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 25px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{rsvp_link}" style="display: inline-block; background-color: #7d2248; color: #ffffff; text-decoration: none; padding: 18px 50px; font-size: 16px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase; border-radius: 4px;">
                                            RSVP Now
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 0 0; font-size: 14px; line-height: 1.7; color: #999; text-align: center;">
                                Kindly note that our celebration is an intimate affair and our invitation is extended to the guests named above only. We appreciate your understanding!
                            </p>

                            <p style="margin: 25px 0 0 0; font-size: 16px; line-height: 1.7; color: #7d2248; text-align: center; font-style: italic;">
                                With love,<br>
                                <span style="font-style: normal; letter-spacing: 1px;">Sam &amp; Jonah</span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 25px 40px; background-color: #faf8f5; text-align: center; border-top: 1px solid #d4a0b3;">
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #7d2248;">
                                <a href="{website_url}" style="color: #7d2248; text-decoration: none;">Visit Our Wedding Website</a>
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9e7080;">
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
                                        <a href="{}" style="display: inline-block; background-color: #7d2248; color: #ffffff; text-decoration: none; padding: 16px 40px; font-size: 15px; font-weight: 400; letter-spacing: 1.5px; text-transform: uppercase; min-width: 200px; text-align: center;">
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

                            <p style="margin: 30px 0 0 0; font-size: 16px; line-height: 1.7; color: #7d2248; text-align: center; font-style: italic; background-color: transparent;">
                                With love,<br>
                                <span style="font-weight: 400; font-style: normal; letter-spacing: 1px; background-color: transparent;">Sam & Jonah</span>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 35px 40px; background-color: #faf8f5; text-align: center; border-top: 1px solid #d4a0b3;">
                            <p style="margin: 0; font-size: 14px; color: #7d2248; letter-spacing: 0.5px; background-color: transparent;">
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

/// One-month reminder email for guests who have confirmed they are attending.
pub fn one_month_reminder_html(guest_names: &[String], website_url: &str) -> String {
    let names_display = match guest_names {
        [] => "friends".to_string(),
        [name] => name.clone(),
        [first, second] => format!("{} and {}", first, second),
        _ => {
            let (last, rest) = guest_names.split_last().expect("guest names are not empty");
            format!("{}, and {}", rest.join(", "), last)
        }
    };

    format!(
        r#"<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>One Month to Go - Sam &amp; Jonah</title>
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <style>
        :root {{ color-scheme: light; supported-color-schemes: light; }}
        @media only screen and (max-width: 620px) {{
            .outer-pad {{ padding: 12px 0 !important; }}
            .inner-table {{ width: 100% !important; }}
            .content-pad {{ padding: 32px 22px !important; }}
            .link-cell {{ display: block !important; width: auto !important; padding: 6px 0 !important; }}
        }}
        @media (prefers-color-scheme: dark) {{
            .email-bg {{ background-color: #f7f3f0 !important; }}
            .email-body {{ background-color: #ffffff !important; color: #4a4a4a !important; }}
            .details-card {{ background-color: #faf8f5 !important; }}
            .website-button {{ background-color: #7d2248 !important; color: #ffffff !important; }}
        }}
    </style>
</head>
<body class="email-bg" style="margin: 0; padding: 0; font-family: 'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif; background-color: #f7f3f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f7f3f0;">
        <tr>
            <td class="outer-pad" align="center" style="padding: 28px 16px;">
                <table role="presentation" class="inner-table email-body" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
                    <tr>
                        <td style="padding: 34px 24px 26px; text-align: center; background-color: #faf8f5; border-bottom: 1px solid #ead9df;">
                            <p style="margin: 0 0 10px; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #9e7080;">The countdown is on</p>
                            <h1 style="margin: 0; font-size: 34px; line-height: 1.25; font-weight: 400; color: #7d2248;">One Month to Go!</h1>
                            <p style="margin: 12px 0 0; font-size: 15px; letter-spacing: 0.8px; color: #6b6b6b;">August 15, 2026 &bull; Rouge, Calgary</p>
                        </td>
                    </tr>

                    <tr>
                        <td class="content-pad" style="padding: 42px; background-color: #ffffff; color: #4a4a4a;">
                            <p style="margin: 0 0 24px; font-size: 17px; line-height: 1.7; color: #6b6b6b; text-align: center;">Dear {names_display},</p>
                            <p style="margin: 0 0 20px; font-size: 17px; line-height: 1.8; color: #5f5f5f; text-align: center;">
                                We can hardly believe it&mdash;our wedding is only one month away! We are so excited to celebrate with you.
                            </p>
                            <p style="margin: 0 0 30px; font-size: 17px; line-height: 1.8; color: #5f5f5f; text-align: center;">
                                Before the big day, please take a moment to visit our website for everything you need to plan your weekend:
                            </p>

                            <table role="presentation" class="details-card" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 30px; background-color: #faf8f5; border: 1px solid #ead9df; border-radius: 6px;">
                                <tr>
                                    <td class="link-cell" width="50%" align="center" style="padding: 18px 10px 9px;">
                                        <a href="{website_url}/details" style="color: #7d2248; font-size: 15px; font-weight: 600; text-decoration: underline;">Wedding Day Details</a>
                                    </td>
                                    <td class="link-cell" width="50%" align="center" style="padding: 18px 10px 9px;">
                                        <a href="{website_url}/travel" style="color: #7d2248; font-size: 15px; font-weight: 600; text-decoration: underline;">Travel Information</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="link-cell" width="50%" align="center" style="padding: 9px 10px 18px;">
                                        <a href="{website_url}/travel" style="color: #7d2248; font-size: 15px; font-weight: 600; text-decoration: underline;">Things to Do in Calgary</a>
                                    </td>
                                    <td class="link-cell" width="50%" align="center" style="padding: 9px 10px 18px;">
                                        <a href="{website_url}/registry" style="color: #7d2248; font-size: 15px; font-weight: 600; text-decoration: underline;">Honeymoon Registry</a>
                                    </td>
                                </tr>
                            </table>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                                <tr>
                                    <td align="center">
                                        <a class="website-button" href="{website_url}" style="display: inline-block; background-color: #7d2248; color: #ffffff; text-decoration: none; padding: 16px 34px; font-size: 15px; letter-spacing: 1.4px; text-transform: uppercase; border-radius: 4px;">Visit Our Website</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0; font-size: 16px; line-height: 1.7; color: #7d2248; text-align: center; font-style: italic;">
                                See you very soon!<br>
                                <span style="font-style: normal; letter-spacing: 1px;">With love, Sam &amp; Jonah</span>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 24px 30px; background-color: #faf8f5; text-align: center; border-top: 1px solid #ead9df;">
                            <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #9e7080;">You are receiving this reminder because your RSVP says you will be joining us.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>"#,
        names_display = names_display,
        website_url = website_url.trim_end_matches('/'),
    )
}

#[cfg(test)]
mod tests {
    use super::one_month_reminder_html;

    #[test]
    fn one_month_reminder_contains_requested_website_sections() {
        let html = one_month_reminder_html(
            &["Alex".to_string(), "Taylor".to_string()],
            "https://samandjonah.com/",
        );

        assert!(html.contains("Dear Alex and Taylor"));
        assert!(html.contains("only one month away"));
        assert!(html.contains("https://samandjonah.com/details"));
        assert!(html.contains("Wedding Day Details"));
        assert!(html.contains("Travel Information"));
        assert!(html.contains("Things to Do in Calgary"));
        assert!(html.contains("https://samandjonah.com/registry"));
        assert!(!html.contains("samandjonah.com//"));
    }
}
