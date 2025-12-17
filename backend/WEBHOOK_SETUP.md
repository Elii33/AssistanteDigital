# Configuration des Webhooks Stripe

Ce guide explique comment configurer les webhooks Stripe pour recevoir des notifications par email lors d'événements (nouvel abonnement, annulation, échec de paiement, etc.).

---

## Prérequis

- Node.js installé
- Stripe CLI installé ([télécharger ici](https://stripe.com/docs/stripe-cli))
- Compte Stripe configuré

---

## Étape 1 : Installer Stripe CLI

### Windows (PowerShell en administrateur)
```powershell
winget install Stripe.StripeCLI
```

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Linux
```bash
# Télécharger depuis https://github.com/stripe/stripe-cli/releases
```

---

## Étape 2 : Se connecter à Stripe CLI

1. Ouvrez un terminal et lancez :
```bash
stripe login
```

2. Vous verrez un message comme :
```
Your pairing code is: appeal-sharp-unreal-super
Press Enter to open the browser...
```

3. **Appuyez sur Entrée** - votre navigateur s'ouvrira

4. **Connectez-vous** à votre compte Stripe

5. Si vous avez la **double authentification (2FA)** activée :
   - Ouvrez votre application d'authentification (Google Authenticator, Authy, etc.)
   - Entrez le code à 6 chiffres affiché

6. **Autorisez** l'accès CLI

7. Retournez dans le terminal - vous devriez voir :
```
Done! The Stripe CLI is configured for [Votre Compte]
```

---

## Étape 3 : Lancer l'écoute des webhooks en local

Dans un terminal **dédié** (gardez-le ouvert), lancez :

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

Vous verrez un message comme :
```
Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**Copiez ce `whsec_...`** - c'est votre Webhook Signing Secret.

---

## Étape 4 : Configurer le fichier .env

Ouvrez `backend/.env` et ajoutez/modifiez :

```env
# Webhook secret (copié depuis stripe listen)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Configuration Email (Gmail)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
ADMIN_EMAIL=votre-email@gmail.com
```

### Comment obtenir le mot de passe d'application Gmail :

1. Allez sur https://myaccount.google.com/apppasswords
2. Connectez-vous avec votre compte Google
3. Sélectionnez **"Mail"** et **"Ordinateur Windows"**
4. Cliquez sur **"Générer"**
5. Copiez le mot de passe de 16 caractères (sans les espaces)

---

## Étape 5 : Démarrer le serveur backend

Dans un **nouveau terminal** :

```bash
cd backend
npm run dev
```

Vous devriez voir :
```
🚀 Serveur backend démarré sur le port 3000
📧 Email configuré: ✅
🔗 Webhook secret: ✅
```

---

## Étape 6 : Tester les webhooks

### Test 1 : Vérifier que le serveur reçoit les webhooks

Dans un **3ème terminal**, déclenchez un événement de test :

```bash
stripe trigger checkout.session.completed
```

Dans le terminal du serveur, vous devriez voir :
```
📨 Webhook reçu: checkout.session.completed
✅ Paiement réussi pour: test@example.com
📧 Email envoyé: ...
```

### Test 2 : Tester l'annulation d'abonnement

```bash
stripe trigger customer.subscription.deleted
```

### Test 3 : Tester l'échec de paiement

```bash
stripe trigger invoice.payment_failed
```

---

## Étape 7 : Tester l'envoi d'email

Utilisez l'endpoint de test :

```bash
curl -X POST http://localhost:3000/api/test-email ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"votre@email.com\"}"
```

Ou avec PowerShell :
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/test-email" -Method POST -ContentType "application/json" -Body '{"email": "votre@email.com"}'
```

---

## Événements gérés

| Événement Stripe | Action |
|------------------|--------|
| `checkout.session.completed` | Email de bienvenue au client + notification admin |
| `customer.subscription.deleted` | Email de confirmation d'annulation + alerte admin |
| `customer.subscription.updated` | Notification si annulation programmée |
| `invoice.paid` | Log (renouvellement automatique) |
| `invoice.payment_failed` | Email d'alerte au client + notification admin |

---

## Configuration en Production

Pour la production, vous devez créer un webhook permanent dans le Dashboard Stripe :

1. Allez sur https://dashboard.stripe.com/webhooks

2. Cliquez sur **"Ajouter un endpoint"**

3. **URL de l'endpoint** : `https://votre-domaine.com/api/webhook`

4. **Événements à écouter** :
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

5. Cliquez sur **"Ajouter l'endpoint"**

6. Cliquez sur l'endpoint créé, puis sur **"Révéler"** le Signing Secret

7. Copiez le `whsec_...` et mettez-le dans votre `.env` de production

---

## Dépannage

### Le webhook ne reçoit pas les événements

1. Vérifiez que `stripe listen` est en cours d'exécution
2. Vérifiez que le serveur backend tourne sur le port 3000
3. Vérifiez l'URL : `localhost:3000/api/webhook`

### Erreur "Webhook signature verification failed"

1. Vérifiez que `STRIPE_WEBHOOK_SECRET` est correct dans `.env`
2. Relancez `stripe listen` pour obtenir un nouveau secret
3. Redémarrez le serveur backend après modification du `.env`

### Les emails ne sont pas envoyés

1. Vérifiez `EMAIL_USER` et `EMAIL_PASSWORD` dans `.env`
2. Assurez-vous d'utiliser un **mot de passe d'application** Gmail (pas votre mot de passe normal)
3. Testez avec `/api/test-email`

### Erreur Gmail "Less secure app access"

Gmail bloque les connexions "moins sécurisées". Solution :
1. Utilisez un **mot de passe d'application** (recommandé)
2. Ou activez l'accès apps moins sécurisées (non recommandé)

---

## Résumé des commandes

```bash
# Terminal 1 : Écoute des webhooks Stripe
stripe listen --forward-to localhost:3000/api/webhook

# Terminal 2 : Serveur backend
cd backend && npm run dev

# Terminal 3 : Tests
stripe trigger checkout.session.completed
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Stripe      │────▶│   Stripe CLI    │────▶│  Backend Node   │
│   (événement)   │     │ (stripe listen) │     │  (localhost)    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   Nodemailer    │
                                                │  (envoi email)  │
                                                └────────┬────────┘
                                                         │
                                    ┌────────────────────┼────────────────────┐
                                    ▼                    ▼                    ▼
                            ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                            │ Email Client │    │ Email Admin  │    │    Logs      │
                            └──────────────┘    └──────────────┘    └──────────────┘
```

---

## Support

En cas de problème :
- Documentation Stripe CLI : https://stripe.com/docs/stripe-cli
- Documentation Webhooks : https://stripe.com/docs/webhooks
- Documentation Nodemailer : https://nodemailer.com/
