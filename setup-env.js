#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables for Admission Portal\n');

const envContent = `# Razorpay Configuration
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
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists!');
  console.log('   Please update it manually with the required variables.');
  console.log('   Check the README.md for detailed instructions.\n');
} else {
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📝 Please update the following variables with your actual credentials:\n');
    console.log('   🔑 Razorpay Key ID (from https://dashboard.razorpay.com/app/keys)');
    console.log('   🔐 Razorpay Key Secret (from https://dashboard.razorpay.com/app/keys)');
    console.log('   ☁️  Cloudinary Cloud Name (from https://cloudinary.com/console)');
    console.log('   📤 Cloudinary Upload Preset (from Cloudinary Settings → Upload)\n');
    console.log('📖 For detailed instructions, see the README.md file.\n');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    console.log('📝 Please create the .env file manually with the content from README.md\n');
  }
}

console.log('🚀 After updating the .env file, run: npm run dev'); 