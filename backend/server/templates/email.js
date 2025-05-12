const getAdminEmailTemplate = (data) => {
  const { name, email, phone, message, type } = data;
  
  return {
    subject: `New ${type === 'brochure' ? 'Brochure Request' : 'Contact Form'} from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FFC107; padding: 20px; text-align: center; color: #000; }
          .content { padding: 20px; background-color: #fff; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>${type === 'brochure' ? 'New Brochure Request' : 'New Contact Form Submission'}</h2>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Name:</span> ${name}
            </div>
            <div class="field">
              <span class="label">Email:</span> ${email}
            </div>
            <div class="field">
              <span class="label">Phone:</span> ${phone}
            </div>
            <div class="field">
              <span class="label">Message:</span><br>
              ${message || 'No message provided'}
            </div>
            <div class="field">
              <span class="label">Type:</span> ${type}
            </div>
          </div>
          <div class="footer">
            <p>Sent from Alfanio Website Contact Form</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      New ${type === 'brochure' ? 'Brochure Request' : 'Contact Form Submission'}
      
      Name: ${name}
      Email: ${email}
      Phone: ${phone}
      Message: ${message || 'No message provided'}
      Type: ${type}
      
      Sent from Alfanio Website Contact Form
    `
  };
};

const getUserEmailTemplate = (data) => {
  const { name } = data;
  
  return {
    subject: 'Thank you for contacting Alfanio',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FFC107; padding: 20px; text-align: center; color: #000; }
          .content { padding: 20px; background-color: #fff; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { 
            display: inline-block;
            padding: 10px 20px;
            background-color: #FFC107;
            color: #000;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Us</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to Alfanio. We have received your message and our team will get back to you as soon as possible.</p>
            <p>Best regards,</p>
            <p>The Alfanio Team</p>
            <a href="https://alfanio.com" class="button">Visit Our Website</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Alfanio. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Thank you for contacting Alfanio

      Dear ${name},

      Thank you for reaching out to Alfanio. We have received your message and our team will get back to you as soon as possible.

      Best regards,
      The Alfanio Team
    `
  };
};

module.exports = {
  getAdminEmailTemplate,
  getUserEmailTemplate
};