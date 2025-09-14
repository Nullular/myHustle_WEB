#!/usr/bin/env python3
"""
MyHustle Tester Email Import Script (Python)

This script imports email addresses from CSV or Excel files into Firestore.

Requirements:
    pip install firebase-admin pandas openpyxl

Usage:
    python scripts/import_emails.py your-file.csv
    python scripts/import_emails.py your-file.xlsx
"""

import sys
import os
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import re

def validate_email(email):
    """Basic email validation"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    # Look for service account key
    service_account_path = os.path.join(os.path.dirname(__file__), '..', 'firebase-service-account.json')
    
    if not os.path.exists(service_account_path):
        print("❌ Firebase service account key not found!")
        print("📋 To get your service account key:")
        print("1. Go to Firebase Console → Project Settings → Service Accounts")
        print("2. Click 'Generate new private key'")
        print("3. Save as 'firebase-service-account.json' in your project root")
        sys.exit(1)
    
    try:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin initialized")
        return firestore.client()
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        sys.exit(1)

def read_email_file(file_path):
    """Read emails from CSV or Excel file"""
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        sys.exit(1)
    
    try:
        # Determine file type and read accordingly
        if file_path.endswith('.xlsx') or file_path.endswith('.xls'):
            df = pd.read_excel(file_path)
            print(f"📊 Read Excel file with {len(df)} rows")
        elif file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
            print(f"📊 Read CSV file with {len(df)} rows")
        else:
            print("❌ Unsupported file format. Use .csv, .xlsx, or .xls")
            sys.exit(1)
        
        return df
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        sys.exit(1)

def extract_emails(df):
    """Extract email addresses from DataFrame"""
    emails = []
    invalid_emails = []
    
    # Try to find email column with different possible names
    email_columns = ['email', 'Email', 'EMAIL', 'email_address', 'Email Address', 'e-mail']
    email_column = None
    
    for col in email_columns:
        if col in df.columns:
            email_column = col
            break
    
    # If no email column found, use first column
    if email_column is None:
        email_column = df.columns[0]
        print(f"⚠️  No 'email' column found, using first column: '{email_column}'")
    
    print(f"📧 Using column: '{email_column}'")
    
    # Extract and validate emails
    for index, row in df.iterrows():
        email = str(row[email_column]).strip().lower()
        
        # Skip empty or NaN values
        if pd.isna(row[email_column]) or email == 'nan' or email == '':
            continue
            
        if validate_email(email):
            emails.append(email)
        else:
            invalid_emails.append(email)
    
    return emails, invalid_emails

def check_existing_emails(db, emails):
    """Check which emails already exist in Firestore"""
    existing_emails = []
    
    print("🔍 Checking for existing emails...")
    
    # Check in batches to avoid too many queries
    batch_size = 10
    for i in range(0, len(emails), batch_size):
        batch = emails[i:i + batch_size]
        
        for email in batch:
            docs = db.collection('allowedEmails').where('email', '==', email).limit(1).get()
            if docs:
                existing_emails.append(email)
    
    return existing_emails

def import_emails_to_firestore(db, emails):
    """Import emails to Firestore in batches"""
    print(f"📤 Importing {len(emails)} emails to Firestore...")
    
    # Firestore batch limit is 500 operations
    batch_size = 500
    total_imported = 0
    
    for i in range(0, len(emails), batch_size):
        batch_emails = emails[i:i + batch_size]
        batch = db.batch()
        
        for email in batch_emails:
            doc_ref = db.collection('allowedEmails').document()
            batch.set(doc_ref, {
                'email': email,
                'addedAt': firestore.SERVER_TIMESTAMP,
                'active': True,
                'importedAt': datetime.now().isoformat(),
                'importedBy': 'python-script'
            })
        
        try:
            batch.commit()
            total_imported += len(batch_emails)
            print(f"✅ Imported batch {i//batch_size + 1}: {len(batch_emails)} emails")
        except Exception as e:
            print(f"❌ Error importing batch {i//batch_size + 1}: {e}")
            return False
    
    print(f"🎉 Successfully imported {total_imported} emails!")
    return True

def main():
    if len(sys.argv) != 2:
        print("📋 Usage: python scripts/import_emails.py <file-path>")
        print("📋 Example: python scripts/import_emails.py tester-emails.csv")
        print("📋 Example: python scripts/import_emails.py tester-emails.xlsx")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    # Initialize Firebase
    db = initialize_firebase()
    
    # Read the file
    print(f"📂 Reading emails from: {file_path}")
    df = read_email_file(file_path)
    
    # Extract emails
    emails, invalid_emails = extract_emails(df)
    
    print(f"📊 Found {len(emails)} valid emails")
    if invalid_emails:
        print(f"⚠️  Found {len(invalid_emails)} invalid emails (skipped)")
        if len(invalid_emails) <= 5:
            print("Invalid emails:", invalid_emails)
    
    if not emails:
        print("❌ No valid emails found. Please check your file format.")
        sys.exit(1)
    
    # Show sample emails
    print("\n📋 Sample emails found:")
    for email in emails[:5]:
        print(f"   {email}")
    if len(emails) > 5:
        print(f"   ... and {len(emails) - 5} more")
    
    # Check for existing emails
    existing_emails = check_existing_emails(db, emails)
    new_emails = [email for email in emails if email not in existing_emails]
    
    if existing_emails:
        print(f"ℹ️  {len(existing_emails)} emails already exist (will be skipped)")
    
    if not new_emails:
        print("✅ All emails already exist in the database!")
        sys.exit(0)
    
    print(f"\n📊 Ready to import {len(new_emails)} new emails")
    
    # Confirm before importing
    response = input("\n❓ Do you want to import these emails? (y/N): ").strip().lower()
    
    if response in ['y', 'yes']:
        success = import_emails_to_firestore(db, new_emails)
        
        if success:
            print("\n🎉 Import completed successfully!")
            print("✅ Your tester validation system is now active.")
            print(f"📊 Total emails in database: {len(emails)}")
        else:
            print("\n❌ Import failed. Please check the errors above.")
    else:
        print("❌ Import cancelled.")

if __name__ == "__main__":
    main()