# Backend Stripe - Assistante Digitale

Backend Node.js/Express pour gérer les paiements Stripe de votre landing page.

## 📋 Prérequis

- Node.js 16+ installé
- Compte Stripe (gratuit)
- Clés API Stripe

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configuration Stripe

#### A. Créer un compte Stripe

1. Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créez votre compte gratuit
3. Activez le mode Test

#### B. Récupérer vos clés API

1. Dashboard Stripe → **Développeurs** → **Clés API**
2. Copiez:
   - **Clé publiable** (pk_test_...)
   - **Clé secrète** (sk_test_...) ⚠️ NE JAMAIS LA PARTAGER

#### C. Créer vos produits et prix

Dans le Dashboard Stripe → **Produits** → **Ajouter un produit**:

**Produit 1: Pack Essentiel**
- Nom: Pack Essentiel - 10h/mois
- Prix: 450€
- Récurrent: Mensuel
- Copiez l'ID du prix: `price_ABC123...`

**Produit 2: Pack Pro**
- Nom: Pack Pro - 20h/mois
- Prix: 850€
- Récurrent: Mensuel
- Copiez l'ID du prix

**Produit 3: Pack Premium**
- Nom: Pack Premium - 40h/mois
- Prix: 1500€
- Récurrent: Mensuel
- Copiez l'ID du prix

**Produit 4: Tarif Horaire (optionnel)**
- Nom: Tarif Horaire
- Prix: 45€
- Type: Paiement unique
- Copiez l'ID du prix

### 3. Configuration du fichier .env

```bash
# Copiez le fichier exemple
cp .env.example .env
```

Éditez le fichier `.env` et remplacez les valeurs:

```env
# Clés Stripe TEST
STRIPE_SECRET_KEY_TEST=sk_test_VOTRE_CLE_ICI
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_VOTRE_CLE_ICI

# Mode (test ou live)
STRIPE_MODE=test

# Configuration serveur
PORT=3000
FRONTEND_URL=http://localhost:4200

# IDs des prix (remplacez par vos vrais IDs)
PRICE_ID_ESSENTIAL=price_ABC123...
PRICE_ID_PRO=price_DEF456...
PRICE_ID_PREMIUM=price_GHI789...
PRICE_ID_HOURLY=price_JKL012...
```

### 4. Démarrer le serveur

```bash
npm start
```

Vous devriez voir:
```
🚀 Serveur backend démarré sur le port 3000
💳 Mode Stripe: test
```

## 🔧 Configuration du Frontend

Maintenant que le backend est prêt, mettez à jour le frontend Angular.

### 1. Modifier stripe.service.ts

Ouvrez `src/app/services/stripe.service.ts` et **décommentez** le code aux lignes 91-117:

```typescript
async redirectToCheckout(planId: string): Promise<void> {
  const plan = this.pricingPlans.find(p => p.id === planId);

  if (!plan) {
    console.error('Plan non trouvé');
    return;
  }

  if (!this.stripe) {
    console.error('Stripe n\'est pas initialisé');
    return;
  }

  try {
    // Appel au backend pour créer une session
    const response = await fetch('http://localhost:3000/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: planId
      })
    });

    const session = await response.json();

    // Redirection vers Stripe Checkout
    const { error } = await this.stripe.redirectToCheckout({
      sessionId: session.sessionId
    });

    if (error) {
      console.error('Erreur Stripe:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
}
```

### 2. Mettre à jour la clé publique Stripe

Dans `src/app/services/stripe.service.ts` ligne 16:

```typescript
private readonly stripePublicKey = 'pk_test_VOTRE_CLE_PUBLIQUE_ICI';
```

## 🧪 Tester les paiements

### 1. Démarrer le backend
```bash
cd backend
npm start
```

### 2. Démarrer le frontend
```bash
cd ..
npm start
```

### 3. Tester un paiement

1. Ouvrez [http://localhost:4200](http://localhost:4200)
2. Cliquez sur un bouton "Choisir..."
3. Vous serez redirigé vers Stripe Checkout
4. Utilisez une carte de test:
   - **Numéro**: 4242 4242 4242 4242
   - **Date**: n'importe quelle date future (ex: 12/25)
   - **CVC**: n'importe quels 3 chiffres (ex: 123)
   - **Code postal**: n'importe lequel

5. Le paiement sera simulé avec succès ✅

## 📡 Endpoints API

### GET /api/health
Vérifier que le serveur fonctionne
```bash
curl http://localhost:3000/api/health
```

### GET /api/plans
Liste des plans configurés
```bash
curl http://localhost:3000/api/plans
```

### POST /api/create-checkout-session
Créer une session de paiement
```bash
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"planId":"essential"}'
```

### GET /api/checkout-session/:sessionId
Récupérer les détails d'une session

## 🔔 Webhooks Stripe

Les webhooks permettent à Stripe de notifier votre backend quand un paiement est effectué.

### Configuration en local (pour tests)

1. Installez Stripe CLI:
```bash
# Windows (avec Scoop)
scoop install stripe

# Mac
brew install stripe/stripe-cli/stripe

# Ou téléchargez depuis: https://stripe.com/docs/stripe-cli
```

2. Connectez-vous:
```bash
stripe login
```

3. Redirigez les webhooks vers votre serveur local:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

4. Copiez le webhook secret affiché et ajoutez-le dans `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
```

### Configuration en production

1. Dashboard Stripe → **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. URL: `https://votre-domaine.com/api/webhook`
4. Événements à écouter:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`

## 🚀 Passage en production

Quand vous êtes prêt à accepter de vrais paiements:

### 1. Activer votre compte Stripe
- Complétez les informations d'entreprise
- Vérification d'identité requise

### 2. Créer les produits en mode LIVE
- Recréez vos 4 produits en mode production
- Copiez les nouveaux Price IDs (commencent par `price_live_...`)

### 3. Mettre à jour .env
```env
# Clés LIVE
STRIPE_SECRET_KEY_LIVE=sk_live_VOTRE_CLE_LIVE
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_VOTRE_CLE_LIVE

# Changer le mode
STRIPE_MODE=live

# IDs des prix LIVE
PRICE_ID_ESSENTIAL=price_live_ABC...
PRICE_ID_PRO=price_live_DEF...
PRICE_ID_PREMIUM=price_live_GHI...
```

### 4. Déployer le backend
Déployez sur:
- **Heroku** (gratuit pour commencer)
- **Railway** (facile à configurer)
- **DigitalOcean** (droplets)
- **AWS EC2** / **Google Cloud**

### 5. Mettre à jour le frontend
Changez l'URL de l'API dans `stripe.service.ts`:
```typescript
const response = await fetch('https://votre-api.com/api/create-checkout-session', {
  // ...
});
```

## 🔒 Sécurité

✅ **Bonnes pratiques déjà implémentées:**
- Clés secrètes dans `.env` (jamais dans le code)
- CORS configuré pour accepter uniquement le frontend
- Validation des données entrantes
- Gestion des erreurs

⚠️ **Important:**
- Ne JAMAIS commit le fichier `.env`
- Ne JAMAIS partager vos clés secrètes
- Utilisez HTTPS en production
- Validez les webhooks avec la signature

## 📊 Monitoring

Consultez votre Dashboard Stripe pour:
- Voir les paiements en temps réel
- Gérer les abonnements
- Suivre les statistiques
- Gérer les remboursements

## 🆘 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifiez que le port 3000 est libre
netstat -ano | findstr :3000

# Changez le port dans .env si nécessaire
PORT=3001
```

### Erreur "Price not found"
- Vérifiez que les `PRICE_ID_*` dans `.env` sont corrects
- Les IDs doivent commencer par `price_` ou `price_test_`

### Le paiement ne fonctionne pas
1. Vérifiez la console du navigateur (F12)
2. Vérifiez les logs du serveur backend
3. Vérifiez que le mode Stripe est cohérent (test/live)

## 📞 Support

- Documentation Stripe: [https://stripe.com/docs](https://stripe.com/docs)
- Dashboard: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- Cartes de test: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

## 📝 Licence

Ce projet est sous licence MIT.
