// Script de test pour vérifier que l'API backend fonctionne
// Usage: node test-api.js

const testBackend = async () => {
  const baseUrl = 'http://localhost:3000';

  console.log('🧪 Test de l\'API Backend Stripe\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test 1: Health check
  try {
    console.log('1️⃣  Test: GET /api/health');
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    console.log('   ✅ Serveur actif');
    console.log(`   📊 Mode: ${data.mode}`);
    console.log(`   ⏰ Timestamp: ${data.timestamp}\n`);
  } catch (error) {
    console.log('   ❌ Erreur: Serveur non accessible');
    console.log('   💡 Assurez-vous que le serveur est démarré: npm start\n');
    return;
  }

  // Test 2: Liste des plans
  try {
    console.log('2️⃣  Test: GET /api/plans');
    const response = await fetch(`${baseUrl}/api/plans`);
    const data = await response.json();
    console.log('   ✅ Plans récupérés');
    data.plans.forEach(plan => {
      const status = plan.configured ? '✅ Configuré' : '⚠️  Non configuré';
      console.log(`   - ${plan.name}: ${status}`);
    });
    console.log('');
  } catch (error) {
    console.log('   ❌ Erreur lors de la récupération des plans\n');
  }

  // Test 3: Création de session (sans vraie redirection)
  try {
    console.log('3️⃣  Test: POST /api/create-checkout-session');
    const response = await fetch(`${baseUrl}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: 'essential' })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Session Stripe créée avec succès');
      console.log(`   🔗 Session ID: ${data.sessionId}`);
      console.log(`   🌐 URL: ${data.url.substring(0, 50)}...\n`);
    } else {
      const error = await response.json();
      console.log(`   ⚠️  Erreur: ${error.error}`);
      if (error.error.includes('non configuré')) {
        console.log('   💡 Configurez vos Price IDs dans le fichier .env\n');
      }
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✨ Tests terminés !\n');
  console.log('📝 Prochaines étapes:');
  console.log('   1. Configurez vos clés Stripe dans .env');
  console.log('   2. Créez vos produits dans le Dashboard Stripe');
  console.log('   3. Ajoutez les Price IDs dans .env');
  console.log('   4. Testez un vrai paiement sur http://localhost:4200\n');
};

testBackend();
