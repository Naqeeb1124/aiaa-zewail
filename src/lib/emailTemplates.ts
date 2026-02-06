export const getBrandedTemplate = (contentHtml: string, siteUrl: string, unsubscribeUrl?: string) => {
    const PROD_LOGO_URL = 'https://aiaa-zewail.vercel.app/aiaa-logo.png';
    return `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: auto; padding: 20px;">
            <div style="text-align: center; padding: 20px 0 30px 0;">
                <a href="${siteUrl}" target="_blank">
                    <img src="${PROD_LOGO_URL}" alt="AIAA Zewail City" style="height: 60px; width: auto; border: 0;">
                </a>
            </div>
            <div style="font-size: 16px; color: #334155;">
                ${contentHtml}
            </div>
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <div style="margin-bottom: 15px;">
                    <a href="https://www.instagram.com/aiaazc/" target="_blank" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                        <img src="https://img.icons8.com/ios-filled/50/2b4b77/instagram.png" alt="Instagram" width="24" height="24" style="border: 0; display: inline-block;">
                    </a>
                    <a href="https://www.linkedin.com/company/aiaazc/" target="_blank" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                        <img src="https://img.icons8.com/ios-filled/50/2b4b77/linkedin.png" alt="LinkedIn" width="24" height="24" style="border: 0; display: inline-block;">
                    </a>
                    <a href="https://discord.gg/9KhjKKCu" target="_blank" style="text-decoration: none; margin: 0 10px; display: inline-block;">
                        <img src="https://img.icons8.com/ios-filled/50/2b4b77/discord-logo.png" alt="Discord" width="24" height="24" style="border: 0; display: inline-block;">
                    </a>
                </div>
                <p style="font-size: 11px; color: #94a3b8; font-family: Helvetica, Arial, sans-serif; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">
                    AIAA Student Branch — Zewail City
                </p>
                <div style="margin-top: 15px;">
                    <a href="${siteUrl}" target="_blank" style="display: inline-block; padding: 8px 18px; background-color: #2b4b77; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-family: Helvetica, Arial, sans-serif;">
                        Visit Website
                    </a>
                </div>
                ${unsubscribeUrl ? `
                <div style="margin-top: 25px;">
                    <a href="${unsubscribeUrl}" target="_blank" style="font-size: 10px; color: #cbd5e1; text-decoration: underline;">
                        Unsubscribe from notifications
                    </a>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};