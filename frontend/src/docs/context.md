# App Blueprint Context File

---

## **1. Project Breakdown**

### **App Name:** Alfanio Pvt Ltd Website  
### **Platform:** Web  
### **App Summary:**  
The Alfanio Pvt Ltd website is a fully responsive, SEO-friendly web application built using React.js and Tailwind CSS. It features a dynamic landing page with a Swiper.js slider, animated text using Framer Motion, and a brochure download popup with email submission. The website includes multiple pages (Home, About, Contact, News, Blog, Gallery) with a fixed navigation bar and footer. Additional features include a world map with animated numbers, a product page with dynamic routes, smooth scrolling using Locomotive.js, and micro-interactions powered by GSAP and Framer Motion. The backend is built with MongoDB, Express, and Node.js, supporting JWT authentication and PWA capabilities.

### **Primary Use Case:**  
Corporate website for Alfanio Pvt Ltd to showcase their products, services, and company information while engaging users with interactive animations and smooth navigation.

### **Authentication Requirements:**  
- **User Accounts:** No user accounts required for general visitors.  
- **Guest Users:** All users can access the website without logging in.  
- **Social Login:** Not applicable.  
- **User Roles:** Only admin access for managing content (e.g., updating product details, blog posts).

---

## **2. Core Features**

1. **Landing Page:**  
   - Swiper.js slider with animated text (Framer Motion).  
   - Brochure download popup with email submission and backend email notification.  

2. **Navigation Bar:**  
   - Fixed navbar with React Router DOM for routing (Home, About, Contact, News, Blog, Gallery).  
   - Social media icons integrated.  

3. **World Map Page:**  
   - Interactive world map with animated numbers on scroll.  

4. **Product Page:**  
   - Dynamic product cards with images, headings, descriptions, and "Explore More" buttons.  
   - Dynamic routes for each product category.  

5. **Smooth Scrolling and Animations:**  
   - Locomotive.js for smooth scrolling.  
   - GSAP and Framer Motion for micro-interactions and animations.  

6. **Footer:**  
   - Fixed footer across all pages.  

7. **Backend Integration:**  
   - MongoDB for database.  
   - Express and Node.js for API handling.  
   - JWT for secure admin access.  

8. **SEO and PWA:**  
   - SEO-friendly semantic tags.  
   - Progressive Web App (PWA) for offline capabilities.  

---

## **3. User Flow**

1. **Landing Page:**  
   - User arrives at the landing page with a slider and animated text.  
   - Clicks the "Download Brochure" button, submits their email, and receives the brochure.  

2. **Navigation:**  
   - User clicks on navbar links (e.g., About, Contact) to navigate to respective pages.  

3. **World Map Page:**  
   - User scrolls to view animated numbers and interactive world map.  

4. **Product Page:**  
   - User browses product cards and clicks "Explore More" to view detailed product information.  

5. **Footer Interaction:**  
   - User scrolls to the bottom of any page to view the fixed footer with contact and social media links.  

---

## **4. Design and UI/UX**

### **Visual Design:**  
- **Color Palette:** Corporate colors (e.g., navy blue, white, and accents of gold).  
- **Typography:** Clean and modern fonts (e.g., Inter or Roboto).  
- **Imagery:** High-quality images for sliders and product cards.  

### **UI/UX Guidelines:**  
- **Consistency:** Fixed navbar and footer across all pages.  
- **Interactivity:** Smooth animations and micro-interactions for engagement.  
- **Responsiveness:** Fully responsive design for all devices (mobile, tablet, desktop).  

---

## **5. Technical Implementation**

### **Frontend:**  
- **Framework:** React.js with JSX files.  
- **Styling:** Tailwind CSS for utility-first styling.  
- **Routing:** React Router DOM for dynamic routing.  
- **Animations:** Framer Motion and GSAP for animations.  
- **Smooth Scrolling:** Locomotive.js.  

### **Backend:**  
- **Database:** MongoDB for storing user submissions and product data.  
- **API:** Express.js for handling API requests.  
- **Authentication:** JWT for admin access.  
- **Email Notification:** Nodemailer for sending emails.  

### **Deployment:**  
- **Frontend:** Vercel for hosting.  
- **Backend:** Render or Vercel for API hosting.  

---

## **6. Workflow Links and Setup Instructions**

### **Tools and Resources:**  
1. **Frontend Setup:**  
   - Install React.js: `npx create-react-app alfanio-website`.  
   - Add Tailwind CSS: Follow [Tailwind CSS installation guide](https://tailwindcss.com/docs/installation).  
   - Install Swiper.js: `npm install swiper`.  
   - Install Framer Motion: `npm install framer-motion`.  
   - Install Locomotive.js: `npm install locomotive-scroll`.  
   - Install GSAP: `npm install gsap`.  

2. **Backend Setup:**  
   - Install Node.js and Express: `npm install express`.  
   - Install MongoDB: Follow [MongoDB setup guide](https://www.mongodb.com/docs/manual/installation/).  
   - Install Nodemailer: `npm install nodemailer`.  
   - Install JWT: `npm install jsonwebtoken`.  

3. **Deployment:**  
   - Frontend: Deploy to Vercel using `vercel`.  
   - Backend: Deploy to Render or Vercel.  

---

This blueprint provides a comprehensive roadmap for building the Alfanio Pvt Ltd website, ensuring a seamless and engaging user experience.