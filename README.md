# Admission Portal

This is a [Next.js](https://nextjs.org) project for an admission portal with payment integration using Razorpay. The portal includes both a traditional payment form and a dynamic payment portal that fetches data from external APIs.

## Features

- **New Application Flow**: Complete admission process with multi-step forms
- **Existing Student Portal**: Payment portal for existing students
- **Dynamic Payment Portal**: Real-time payment portal that fetches data from external APIs
- **Razorpay Integration**: Secure payment processing
- **File Upload**: Document upload functionality with Cloudinary
- **Auto-save**: Form data is automatically saved as users progress
- **PDF Generation**: Receipt generation for completed payments
- **Responsive Design**: Mobile-friendly interface

## Portal Access

### New Application
- Complete admission process with personal info, academic details, program selection
- Payment integration with Razorpay
- Form auto-save functionality

### Existing Student Portal
- Login with email and password
- View payment history and fee details
- Make payments for application fees
- Access to dynamic payment portal

### Dynamic Payment Portal
- Real-time data fetching from external APIs
- Complete payment management system
- Payment history tracking
- Coupon code support
- Full and partial payment options
- Access via `/payment-portal` route or "Dynamic Portal" button in existing student portal

## Environment Setup

Before running the application, you need to set up your environment variables. Create a `.env` file in the root directory with the following variables:

### Required Environment Variables

```bash
# Razorpay Configuration
# Get these from your Razorpay Dashboard: https://dashboard.razorpay.com/app/keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Cloudinary Configuration (for file uploads)
# Get these from your Cloudinary Dashboard: https://cloudinary.com/console
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset

# Environment Configuration
NODE_ENV=development

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://backend-rakj.onrender.com/api/v1

# Application Configuration
NEXT_PUBLIC_APP_NAME=Admission Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000

# External API Configuration (for Dynamic Payment Portal)
# The dynamic payment portal fetches data from these endpoints
NEXT_PUBLIC_EXTERNAL_API_BASE_URL=https://backend-rakj.onrender.com/api/v1
```

### How to Get Razorpay Credentials

1. **Sign up/Login to Razorpay**: Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. **Navigate to Settings**: Click on "Settings" in the left sidebar
3. **API Keys**: Go to "API Keys" section
4. **Generate Keys**: 
   - For testing: Use "Test Mode" keys (starts with `rzp_test_`)
   - For production: Use "Live Mode" keys (starts with `rzp_live_`)
5. **Copy the keys**:
   - **Key ID**: This is your public key (safe to expose in frontend)
   - **Key Secret**: This is your private key (keep it secret, only used in backend)

### How to Get Cloudinary Credentials

1. **Sign up/Login to Cloudinary**: Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. **Get Cloud Name**: Found in your dashboard overview
3. **Create Upload Preset**:
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set signing mode to "Unsigned" for client-side uploads
   - Save and copy the preset name

## API Integration

The dynamic payment portal integrates with external APIs to fetch real-time data:

### Required API Endpoints

The following endpoints should be available at `https://backend-rakj.onrender.com/api/v1`:

1. **User Data**: `GET /admission-auth/user/{userId}`
   - Returns user profile and payment information
   - Used by dynamic payment portal to fetch student data

2. **Payment Submission**: `POST /admission/submit`
   - Submits payment data after successful Razorpay payment
   - Includes user details, course info, and transaction details

3. **Payment Update**: `POST /admission-auth/user/{userId}/payment`
   - Updates payment information after successful payment
   - Records transaction details and payment status

### API Response Format

The dynamic payment portal expects the following data structure:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "phone": "1234567890",
    "isActive": true,
    "admissionFormId": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "programCategory": "Technology",
      "programName": "Full Stack Development",
      "specialization": "Web Development",
      "campus": "Mumbai",
      "applicationStatus": "approved",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "paymentInformation": [{
      "totalFee": 50000,
      "processingFee": 1000,
      "registrationFee": 2000,
      "courseFee": 47000,
      "totalAmountPaid": 2000,
      "totalAmountDue": 48000,
      "totalDiscount": 0,
      "paymentStatus": "pending",
      "paymentTransactions": []
    }]
  }
}
```

## Getting Started

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, set up your environment variables:

```bash
# Option 1: Use the setup script (recommended)
npm run setup

# Option 2: Create .env file manually
# Copy the environment variables from the section above into a .env file
```

**Important**: After running the setup script, you must update the `.env` file with your actual Razorpay and Cloudinary credentials.

Finally, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
