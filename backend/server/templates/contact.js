module.exports = ({ name, email, phone, message }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f8f9fa; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #ffffff; padding: 20px; border: 1px solid #e9ecef; }
    .message-box { background: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 10px 0; }
    .footer { font-size: 12px; color: #6c757d; margin-top: 20px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="color: #333; margin: 0;">New Contact Form Submission</h2>
    </div>
    <div class="content">
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Message:</strong></p>
      <div class="message-box">
        ${message}
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from your website contact form.</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>
`;
