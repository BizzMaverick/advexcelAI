# Setting Up Google Workspace MX Records in AWS Route 53

This guide provides step-by-step instructions for setting up Google Workspace MX records in AWS Route 53.

## MX Records for Google Workspace

Google Workspace requires the following MX records to be set up for your domain:

| Priority | Mail Server             |
|----------|-------------------------|
| 1        | ASPMX.L.GOOGLE.COM      |
| 5        | ALT1.ASPMX.L.GOOGLE.COM |
| 5        | ALT2.ASPMX.L.GOOGLE.COM |
| 10       | ALT3.ASPMX.L.GOOGLE.COM |
| 10       | ALT4.ASPMX.L.GOOGLE.COM |

## Manual Setup in AWS Route 53

### Step 1: Log in to AWS Management Console

1. Go to [AWS Management Console](https://aws.amazon.com/console/)
2. Sign in with your AWS account credentials

### Step 2: Navigate to Route 53

1. In the search bar at the top, type "Route 53" and select it from the results
2. In the Route 53 dashboard, click on "Hosted zones" in the left sidebar

### Step 3: Select Your Domain

1. Find your domain in the list of hosted zones
2. Click on your domain name to view its records

### Step 4: Create MX Records

1. Click the "Create record" button
2. In the "Quick create record" form:
   - Leave the "Record name" field blank (or enter @ to represent the root domain)
   - Set "Record type" to MX
   - Set "TTL" to 3600 (1 hour)
   - In the "Value" field, enter: `1 ASPMX.L.GOOGLE.COM`
   - Click "Add another record"

3. For the second record:
   - Leave the "Record name" field blank
   - Set "Record type" to MX
   - Set "TTL" to 3600
   - In the "Value" field, enter: `5 ALT1.ASPMX.L.GOOGLE.COM`
   - Click "Add another record"

4. Repeat for the remaining records:
   - `5 ALT2.ASPMX.L.GOOGLE.COM`
   - `10 ALT3.ASPMX.L.GOOGLE.COM`
   - `10 ALT4.ASPMX.L.GOOGLE.COM`

5. After adding all records, click "Create records"

### Step 5: Verify MX Records

1. Wait 5-10 minutes for DNS propagation
2. Return to the Google Workspace setup page
3. Click the "Check my records" or "Verify" button

## Using the Automated Script

If you prefer to use the automated script:

1. Install the AWS SDK:
   ```
   npm install aws-sdk
   ```

2. Configure your AWS credentials:
   ```
   aws configure
   ```

3. Edit the `scripts/setup-mx-records.js` file:
   - Update the `domainName` with your actual domain
   - Update the AWS region if needed

4. Run the script:
   ```
   node scripts/setup-mx-records.js
   ```

## Troubleshooting

If you encounter issues:

1. **DNS Propagation**: DNS changes can take up to 48 hours to fully propagate
2. **Existing Records**: Delete any existing MX records for your domain before adding new ones
3. **Verification Failures**: Double-check that all MX records are entered exactly as shown
4. **AWS Permissions**: Ensure your AWS user has permissions to modify Route 53 records

## Next Steps After MX Setup

After setting up MX records:

1. Complete the Google Workspace email setup
2. Set up SPF records for email authentication
3. Set up DKIM for enhanced security
4. Set up DMARC for email policy enforcement

These additional records will be guided by the Google Workspace setup process.