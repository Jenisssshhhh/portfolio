# Jenish Kshetri - Portfolio

A modern, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Live Demo
Visit: [jenishkshetri.com.np](https://jenishkshetri.com.np)

## 🛠️ Tech Stack
- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **CMS**: Sanity.io
- **Deployment**: Vercel

## 📦 Features
- Responsive design
- Interactive animations
- Contact form
- Project showcase
- Skills display
- Timeline
- Research section

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Sanity.io account

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-07-02
   SANITY_API_TOKEN=your_read_only_token
   ```

4. **Get your Sanity credentials**
   - Go to [sanity.io/manage](https://www.sanity.io/manage)
   - Create a new project or use existing one
   - Go to Settings → API
   - Create a new token with "Viewer" permissions (read-only)
   - Copy your project ID and token

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add the same variables from `.env.local`
4. Add custom domain: `jenishkshetri.com.np`
5. Deploy automatically

### Other Platforms
For other hosting platforms, add the environment variables in their respective dashboards.

## 🔒 Security Notes
- This project uses environment variables to secure Sanity credentials
- Never commit `.env.local` or any environment files
- Use read-only tokens for public access
- Each developer should use their own Sanity project

## 📄 License
MIT License
