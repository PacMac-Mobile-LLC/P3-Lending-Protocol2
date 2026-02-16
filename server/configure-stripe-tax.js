require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20',
});

async function configureStripeTax() {
    try {
        console.log('📋 Retrieving current Stripe Tax settings...\n');

        // Get current settings
        const currentSettings = await stripe.tax.settings.retrieve();
        console.log('Current Settings:');
        console.log(JSON.stringify(currentSettings, null, 2));
        console.log('\n');

        // Update tax settings
        console.log('⚙️  Updating Stripe Tax settings...\n');
        const updatedSettings = await stripe.tax.settings.update({
            defaults: {
                tax_code: 'txcd_10103000' // SaaS (cloud software)
            }
        });

        console.log('✅ Updated Settings:');
        console.log(JSON.stringify(updatedSettings, null, 2));
        console.log('\n');

        console.log('✅ Stripe Tax Configuration Complete!');
        console.log('   - Default tax code: txcd_10103000 (SaaS)');
        console.log('   - Platform fees will use automatic tax');
        console.log('   - Deposits will explicitly disable tax in checkout');

    } catch (error) {
        console.error('❌ Error configuring Stripe Tax:', error.message);
        if (error.raw) {
            console.error('Details:', JSON.stringify(error.raw, null, 2));
        }
        process.exit(1);
    }
}

configureStripeTax();
