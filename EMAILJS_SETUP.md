# 📧 Configuration EmailJS - Guide complet

Ce guide vous explique comment configurer EmailJS pour recevoir les emails de contact sur **derisbourgarnaud@gmail.com**.

## 🚀 Étape 1 : Créer un compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Cliquez sur "Sign Up" (Inscription)
3. Créez un compte gratuit (200 emails/mois inclus)
4. Confirmez votre email

## 📬 Étape 2 : Ajouter votre service email

1. Une fois connecté, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez **"Gmail"** (car vous utilisez derisbourgarnaud@gmail.com)
4. Cliquez sur **"Connect Account"**
5. Connectez-vous avec votre compte Gmail **derisbourgarnaud@gmail.com**
6. Autorisez EmailJS à envoyer des emails
7. Donnez un nom au service (ex: "gmail_service")
8. **COPIEZ le Service ID** (ressemble à `service_xxxxxxx`)

## 📝 Étape 3 : Créer un template d'email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Configurez le template comme suit :

### Configuration du template :

**Subject (Sujet):**
```
Nouveau message de {{from_name}} - {{project_type}}
```

**Content (Contenu HTML):**
```html
<h2>Nouveau message depuis votre landing page</h2>

<p><strong>Nom:</strong> {{from_name}}</p>
<p><strong>Email:</strong> {{from_email}}</p>
<p><strong>Type de projet:</strong> {{project_type}}</p>

<h3>Message:</h3>
<p>{{message}}</p>

<hr>
<p style="color: #666; font-size: 12px;">
  Cet email a été envoyé depuis le formulaire de contact de votre site web.
</p>
```

**To Email:**
```
{{to_email}}
```

4. Cliquez sur **"Save"**
5. **COPIEZ le Template ID** (ressemble à `template_xxxxxxx`)

## 🔑 Étape 4 : Récupérer votre Public Key

1. Allez dans **"Account"** > **"General"**
2. Dans la section **"API Keys"**, vous verrez votre **Public Key**
3. **COPIEZ la Public Key** (ressemble à `xxxxxxxxxxxxxx`)

## 💻 Étape 5 : Mettre à jour votre code

Ouvrez le fichier `src/app/services/email.service.ts` et remplacez les valeurs :

```typescript
private serviceId = 'VOTRE_SERVICE_ID_ICI';      // Ex: service_abc123
private templateId = 'VOTRE_TEMPLATE_ID_ICI';    // Ex: template_xyz789
private publicKey = 'VOTRE_PUBLIC_KEY_ICI';      // Ex: your_public_key_here
```

## ✅ Étape 6 : Tester

1. Lancez votre application : `npm start`
2. Remplissez le formulaire de contact
3. Cliquez sur "Envoyer le message"
4. Vérifiez votre boîte mail **derisbourgarnaud@gmail.com**

## 🎉 C'est terminé !

Vous recevrez maintenant tous les messages de contact directement sur **derisbourgarnaud@gmail.com** !

## 📊 Limites du plan gratuit

- ✅ 200 emails par mois
- ✅ 2 services email
- ✅ 3 templates
- ✅ Support basique

Si vous avez plus de trafic, vous pouvez passer au plan payant.

## 🆘 Problèmes courants

### "EmailJS is not initialized"
- Vérifiez que la Public Key est correcte
- Vérifiez qu'il n'y a pas d'espaces avant/après les clés

### "Service ID not found"
- Vérifiez que le Service ID correspond à celui de votre compte EmailJS
- Assurez-vous d'avoir activé le service Gmail

### "Template not found"
- Vérifiez le Template ID
- Assurez-vous que le template est bien enregistré

## 📞 Besoin d'aide ?

Consultez la documentation EmailJS : [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
