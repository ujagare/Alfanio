# Alfanio Website Production Checklist

This document provides a comprehensive checklist for deploying the Alfanio website to production.

## Pre-Deployment Checks

### Environment Configuration

- [x] Set `NODE_ENV=production` in `.env` file
- [x] Configure MongoDB Atlas connection details
- [x] Set up email service credentials
- [x] Update client URLs to production domain
- [x] Set secure JWT and cookie secrets

### Security

- [x] Enable CSRF protection
- [x] Configure secure CORS settings
- [x] Set up rate limiting
- [x] Enable secure cookie settings
- [x] Configure Content Security Policy
- [x] Remove development-only code

### Performance

- [x] Simplify MongoDB connection settings for compatibility
- [x] Configure proper caching for static assets
- [x] Enable compression
- [x] Optimize frontend build settings
- [x] Set up proper error handling

### SEO

- [x] Verify meta tags
- [x] Check robots.txt configuration
- [x] Ensure sitemap.xml is up to date
- [x] Verify canonical URLs

## Deployment Steps

### 1. Prepare the Server

- [ ] Install Node.js (v20.18.2 or later)
- [ ] Install PM2 globally: `npm install -g pm2`
- [ ] Install Nginx: `sudo apt-get install nginx`
- [ ] Install Certbot for SSL: `sudo apt-get install certbot python3-certbot-nginx`

### 2. Set Up SSL Certificate

- [ ] Obtain SSL certificate: `sudo certbot --nginx -d alfanio.in -d www.alfanio.in`
- [ ] Verify auto-renewal: `sudo certbot renew --dry-run`

### 3. Configure Nginx

- [ ] Copy `nginx.conf` to `/etc/nginx/nginx.conf`
- [ ] Create site configuration: `/etc/nginx/sites-available/alfanio`
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/alfanio /etc/nginx/sites-enabled/`
- [ ] Test configuration: `sudo nginx -t`
- [ ] Restart Nginx: `sudo systemctl restart nginx`

### 4. Deploy the Application

- [ ] Clone repository: `git clone https://github.com/ujagare/Alfanio.git`
- [ ] Install dependencies: `npm run install:all`
- [ ] Build the application: `npm run build`
- [ ] Start with PM2: `pm2 start ecosystem.config.js --env production`
- [ ] Save PM2 process list: `pm2 save`
- [ ] Set up PM2 startup script: `pm2 startup`

### 5. Set Up Monitoring

- [ ] Configure PM2 monitoring: `pm2 install pm2-logrotate`
- [ ] Set up log rotation for Nginx: `sudo nano /etc/logrotate.d/nginx`
- [ ] Set up server monitoring (optional): `pm2 install pm2-server-monit`

## Post-Deployment Checks

### Functionality

- [ ] Verify all pages load correctly
- [ ] Test contact form submission
- [ ] Test brochure request form
- [ ] Check mobile responsiveness
- [ ] Verify all images and assets load properly

### Performance

- [ ] Run Lighthouse audit
- [ ] Check page load times
- [ ] Verify caching is working
- [ ] Test under load (if possible)

### Security

- [ ] Verify SSL is working correctly
- [ ] Check security headers
- [ ] Test rate limiting
- [ ] Verify CORS settings

### SEO

- [ ] Verify Google Analytics is tracking
- [ ] Check meta tags are being rendered correctly
- [ ] Verify robots.txt is accessible
- [ ] Check sitemap.xml is accessible

## Maintenance Tasks

### Regular Maintenance

- [ ] Update SSL certificates (automatic with Certbot)
- [ ] Monitor server resources
- [ ] Check and rotate logs
- [ ] Update dependencies regularly

### Backup Strategy

- [ ] Set up MongoDB Atlas backups
- [ ] Create regular backups of application code
- [ ] Document restore procedures

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. **Test the connection separately**:

   ```
   node test-mongodb-connection.js
   ```

2. **Check your MongoDB Atlas credentials** in the `.env` file:

   - Verify `MONGODB_URI` is correct
   - Verify `MONGO_USERNAME` and `MONGO_PASSWORD` are correct
   - Ensure your IP address is whitelisted in MongoDB Atlas

3. **Common MongoDB errors**:
   - `option X is not supported`: The MongoDB driver version may not support certain connection options
   - `MongoServerSelectionError`: Cannot connect to any server in the cluster (network issue or wrong credentials)
   - `MongoParseError`: The connection string format is incorrect

### Email Configuration Issues

If emails are not being sent:

1. **Verify email credentials** in the `.env` file
2. **Check if Gmail requires an app-specific password**
3. **Test email sending separately** using a simple script

## Emergency Procedures

### Rollback Procedure

1. Stop the current application: `pm2 stop all`
2. Check out the previous version: `git checkout <previous-tag>`
3. Rebuild: `npm run build`
4. Restart: `pm2 restart all`

### Contact Information

- Technical Support: [Your technical contact]
- Domain Registrar: [Domain registrar contact]
- Hosting Provider: [Hosting provider contact]

---

Last updated: June 2, 2024
