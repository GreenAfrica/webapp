# Firebase Setup Instructions

## 1. Deploy Firestore Security Rules

The Firestore security rules have been created in `firestore.rules`. You need to deploy them to your Firebase project:

### Option A: Using Firebase Console (Recommended for now)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "green-africa" project
3. Navigate to Firestore Database > Rules
4. Copy the contents of `firestore.rules` and paste them into the rules editor
5. Click "Publish"

### Option B: Using Firebase CLI (for future deployments)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Deploy rules
firebase deploy --only firestore:rules
```

## 2. Deploy Firestore Indexes

The app requires composite indexes for efficient queries. You can deploy them using either method:

### Option A: Using Firebase Console (Quick Fix)
If you see index errors with direct links in your console, click the provided links to create indexes automatically:
- Example: `You can create it here: https://console.firebase.google.com/v1/r/project/green-africa/firestore/indexes?create_composite=...`

### Option B: Deploy Index Configuration File
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "green-africa" project  
3. Navigate to Firestore Database > Indexes
4. Import the index configuration from `firestore.indexes.json`

### Option C: Using Firebase CLI
```bash
firebase deploy --only firestore:indexes
```

The required indexes are:
- **transactions** collection: `userId` (Ascending) + `date` (Descending)
- **redemptions** collection: `userId` (Ascending) + `createdAt` (Descending)

## 3. Configure Authentication Providers

### Google Authentication
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Google provider
3. Add your domain to authorized domains if needed

### Facebook Authentication  
1. Go to Firebase Console > Authentication > Sign-in method
2. Enable Facebook provider
3. You'll need to create a Facebook App and get App ID/Secret
4. Follow Firebase documentation for Facebook setup

### Phone Authentication
1. Go to Firebase Console > Authentication > Sign-in method  
2. Enable Phone provider
3. reCAPTCHA will be automatically configured

## 4. Current Status

The app is currently set up with:
- ✅ Firebase client configuration
- ✅ Authentication context and hooks
- ✅ Firestore database structure
- ✅ Security rules (need deployment)
- ✅ Firestore indexes (need deployment)
- ⏳ Waiting for security rules and indexes deployment to resolve permission/query errors

## 5. Next Steps

1. Deploy the security rules (step 1 above)
2. Deploy the Firestore indexes (step 2 above)
3. Enable authentication providers (step 3 above)  
4. Test the authentication flow
5. The permission and index errors should be resolved once rules and indexes are deployed

## 6. Testing

Once rules are deployed, you should be able to:
- Sign in with Google/Facebook (after enabling providers)
- Create user profiles in Firestore
- View and manage user data
- Use the points and referral system
