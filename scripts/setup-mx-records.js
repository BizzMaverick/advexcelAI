/**
 * AWS Route 53 MX Records Setup Script
 * 
 * This script helps you set up MX records for Google Workspace in AWS Route 53.
 * 
 * Prerequisites:
 * - AWS SDK installed: npm install aws-sdk
 * - AWS credentials configured
 * - Domain hosted in Route 53
 */

const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({ region: 'us-east-1' }); // Change to your AWS region
const route53 = new AWS.Route53();

// Configuration
const config = {
  // Your domain name
  domainName: 'yourdomain.com', // Replace with your actual domain
  
  // Google Workspace MX records
  mxRecords: [
    { priority: 1, host: 'ASPMX.L.GOOGLE.COM' },
    { priority: 5, host: 'ALT1.ASPMX.L.GOOGLE.COM' },
    { priority: 5, host: 'ALT2.ASPMX.L.GOOGLE.COM' },
    { priority: 10, host: 'ALT3.ASPMX.L.GOOGLE.COM' },
    { priority: 10, host: 'ALT4.ASPMX.L.GOOGLE.COM' }
  ],
  
  // TTL in seconds
  ttl: 3600 // 1 hour
};

/**
 * Get the Hosted Zone ID for the domain
 */
async function getHostedZoneId() {
  try {
    const params = {
      DNSName: config.domainName
    };
    
    const response = await route53.listHostedZonesByName(params).promise();
    
    if (response.HostedZones.length === 0) {
      throw new Error(`No hosted zone found for domain: ${config.domainName}`);
    }
    
    // Find the exact match for the domain
    const hostedZone = response.HostedZones.find(zone => 
      zone.Name === `${config.domainName}.` || zone.Name === config.domainName
    );
    
    if (!hostedZone) {
      throw new Error(`No exact match found for domain: ${config.domainName}`);
    }
    
    return hostedZone.Id.replace('/hostedzone/', '');
  } catch (error) {
    console.error('Error getting hosted zone ID:', error);
    throw error;
  }
}

/**
 * Create MX records in Route 53
 */
async function createMXRecords(hostedZoneId) {
  try {
    // Format MX records for Route 53
    const resourceRecords = config.mxRecords.map(record => ({
      Value: `${record.priority} ${record.host}`
    }));
    
    const params = {
      HostedZoneId: hostedZoneId,
      ChangeBatch: {
        Changes: [
          {
            Action: 'UPSERT', // Create or update
            ResourceRecordSet: {
              Name: config.domainName,
              Type: 'MX',
              TTL: config.ttl,
              ResourceRecords: resourceRecords
            }
          }
        ]
      }
    };
    
    const response = await route53.changeResourceRecordSets(params).promise();
    return response;
  } catch (error) {
    console.error('Error creating MX records:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`Setting up MX records for ${config.domainName}...`);
    
    // Get the hosted zone ID
    const hostedZoneId = await getHostedZoneId();
    console.log(`Found hosted zone ID: ${hostedZoneId}`);
    
    // Create MX records
    const response = await createMXRecords(hostedZoneId);
    console.log('MX records created successfully!');
    console.log(`Change ID: ${response.ChangeInfo.Id}`);
    console.log(`Status: ${response.ChangeInfo.Status}`);
    console.log('Please wait for DNS propagation (up to 48 hours).');
    
  } catch (error) {
    console.error('Failed to set up MX records:', error);
  }
}

// Run the script
main();

/**
 * MANUAL SETUP INSTRUCTIONS:
 * 
 * If you prefer to set up the MX records manually in the AWS Console:
 * 
 * 1. Go to AWS Management Console > Route 53 > Hosted zones
 * 2. Click on your domain name
 * 3. Click "Create record"
 * 4. Leave the "Record name" field blank (or enter @ for the root domain)
 * 5. Set "Record type" to MX
 * 6. Set TTL to 3600 (1 hour)
 * 7. In the "Value" field, enter each MX record in this format: "PRIORITY MAIL_SERVER"
 *    For example: "1 ASPMX.L.GOOGLE.COM"
 * 8. Click "Create records"
 * 
 * Repeat for each MX record or use the "Add another record" button.
 */