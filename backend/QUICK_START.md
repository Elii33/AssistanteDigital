# 🚀 Démarrage Rapide - Backend Stripe

## Étapes pour activer les paiements (15 minutes)

### 1️⃣ Créer un compte Stripe (3 min)

1. Allez sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Créez votre compte (gratuit)
3. Restez en mode **TEST** pour commencer

### 2️⃣ Récupérer vos clés API (1 min)

1. Dashboard Stripe → **Développeurs** → **Clés API**
2. Vous verrez:
   - **Clé publiable**: `pk_test_...`
   - **Clé secrète**: `sk_test_...` (cliquez sur "Révéler")

### 3️⃣ Créer vos produits (5 min)

Dashboard Stripe → **Produits** → **Ajouter un produit**

Créez ces 3 produits:

**Pack Essentiel**
- Nom du produit: `Pack Essentiel`
- Description: `10h d'assistance mensuelle`
- Prix: `450` EUR
- Type: ✅ **Récurrent**
- Fréquence: **Mensuel**
- Cliquez sur "Enregistrer"
- ⭐ **Copiez le Price ID** (commence par `price_...`)

**Pack Pro**
- Nom: `Pack Pro`
- Description: `20h d'assistance mensuelle`
- Prix: `850` EUR
- Type: **Récurrent** / **Mensuel**
- ⭐ **Copiez le Price ID**

**Pack Premium**
- Nom: `Pack Premium`
- Description: `40h d'assistance mensuelle`
- Prix: `1500` EUR
- Type: **Récurrent** / **Mensuel**
- ⭐ **Copiez le Price ID**

### 4️⃣ Configurer le backend (3 min)

1. Copiez le fichier de configuration:
```bash
cd backend
copy .env.example .env
```

2. Éditez `.env` avec vos vraies valeurs:
```env
# Collez vos clés Stripe
STRIPE_SECRET_KEY_TEST=sk_test_VOTRE_VRAIE_CLE_ICI
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_VOTRE_VRAIE_CLE_ICI

# Mode test
STRIPE_MODE=test

# Configuration serveur (ne pas modifier pour l'instant)
PORT=3000
FRONTEND_URL=http://localhost:4200

# Collez vos Price IDs
PRICE_ID_ESSENTIAL=price_ABC123...
PRICE_ID_PRO=price_DEF456...
PRICE_ID_PREMIUM=price_GHI789...
```

### 5️⃣ Configurer le frontend (2 min)

Ouvrez `../src/app/services/stripe.service.ts` et ligne 16, remplacez:

```typescript
private readonly stripePublicKey = 'pk_test_VOTRE_VRAIE_CLE_PUBLIQUE_ICI';
```

### 6️⃣ Démarrer ! (1 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

Vous devriez voir:
```
🚀 Serveur backend démarré sur le port 3000
💳 Mode Stripe: test
```

**Terminal 2 - Frontend:**
```bash
cd ..
npm start
```

### 7️⃣ Tester un paiement

1. Ouvrez [http://localhost:4200](http://localhost:4200)
2. Scrollez jusqu'à la section des forfaits
3. Cliquez sur **"Choisir Pro"**
4. Vous êtes redirigé vers Stripe Checkout ✅
5. Remplissez le formulaire avec:
   - Email: `test@example.com`
   - Carte: `4242 4242 4242 4242`
   - Date: `12/25`
   - CVC: `123`
   - Nom: `Test User`
6. Validez ✅

**Le paiement est simulé avec succès !**

Vérifiez dans Dashboard Stripe → **Paiements** pour voir la transaction de test.

## ✅ Checklist de vérification

- [ ] Compte Stripe créé
- [ ] 3 produits créés dans Stripe
- [ ] 3 Price IDs copiés
- [ ] Fichier `.env` configuré dans /backend
- [ ] Clé publique dans `stripe.service.ts`
- [ ] Backend démarré sans erreur
- [ ] Frontend démarré sans erreur
- [ ] Paiement test réussi

## 🎉 Félicitations !

Votre système de paiement est fonctionnel en mode test.

## 🔄 Prochaines étapes

### Pour passer en production:

1. **Activer votre compte Stripe**
   - Complétez les informations d'entreprise
   - Vérification d'identité

2. **Recréer les produits en mode LIVE**
   - Créez à nouveau vos 3 produits
   - Copiez les nouveaux Price IDs (commencent par `price_live_...`)

3. **Mettre à jour .env**
   ```env
   STRIPE_SECRET_KEY_LIVE=sk_live_...
   STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
   STRIPE_MODE=live
   PRICE_ID_ESSENTIAL=price_live_...
   PRICE_ID_PRO=price_live_...
   PRICE_ID_PREMIUM=price_live_...
   ```

4. **Déployer le backend**
   - Heroku (gratuit)
   - Railway (facile)
   - DigitalOcean
   - Votre propre serveur

5. **Mettre à jour l'URL du backend dans le frontend**
   - `stripe.service.ts` ligne 84
   - Remplacez `http://localhost:3000` par votre URL de production

## 🆘 Problèmes courants

### "Cannot connect to backend"
➡️ Vérifiez que le backend est démarré: `cd backend && npm start`

### "Invalid price ID"
➡️ Vérifiez que vous avez bien copié les Price IDs (commencent par `price_`)

### "Stripe not initialized"
➡️ Vérifiez que vous avez mis à jour la clé publique dans `stripe.service.ts`

## 📞 Besoin d'aide ?

- Documentation complète: [backend/README.md](README.md)
- Documentation Stripe: [https://stripe.com/docs](https://stripe.com/docs)
- Dashboard Stripe: [https://dashboard.stripe.com](https://dashboard.stripe.com)
