/**
 * Standardized Error Messages (French for users)
 */

module.exports = {
  AUTH: {
    REQUIRED: 'Nom d\'utilisateur et mot de passe requis',
    TOO_MANY_ATTEMPTS: 'Trop de tentatives de connexion. Veuillez réessayer plus tard.',
    INVALID_CREDENTIALS: 'Identifiants invalides',
    INTERNAL_ERROR: 'Erreur interne du serveur',
    ADMIN_NOT_FOUND: 'Administrateur non trouvé',
    PASSWORDS_DONT_MATCH: 'Les nouveaux mots de passe ne correspondent pas',
    PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères',
    ENV_PASS_CHANGE_RESTRICTED: 'Impossible de changer le mot de passe .env via le tableau de bord.',
    ENV_EMAIL_CHANGE_RESTRICTED: 'Impossible de mettre à jour l\'email pour l\'administrateur .env.',
    UNAUTHORIZED: 'Accès non autorisé',
    FORBIDDEN: 'Accès interdit. Droits administrateur requis.',
  },
  CONTENT: {
    NOT_FOUND: 'Contenu non trouvé',
    TYPE_NOT_FOUND: 'Type de contenu non trouvé',
    INVALID_DATA: 'Données de contenu invalides',
    UPDATE_FAILED: 'Échec de la mise à jour du contenu',
    LOAD_FAILED: 'Échec du chargement du contenu',
  },
  CONTACT: {
    FIELDS_REQUIRED: 'Tous les champs obligatoires doivent être remplis',
    INVALID_EMAIL: 'Adresse email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    SEND_FAILED: 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer.',
    FETCH_FAILED: 'Échec de la récupération des contacts',
    NOT_FOUND: 'Contact non trouvé',
    INVALID_STATUS: 'Statut invalide',
  },
  INVOICE: {
    NOT_FOUND: 'Facture non trouvée',
    FIELDS_REQUIRED: 'La facture et les articles sont requis',
    CLIENT_REQUIRED: 'Le nom du client, l\'email et la date d\'émission sont requis',
    CREATE_FAILED: 'Échec de la création de la facture',
    UPDATE_FAILED: 'Échec de la mise à jour du statut de la facture',
    SEND_FAILED: 'Échec de l\'envoi de la facture',
    DELETE_FAILED: 'Échec de la suppression de la facture',
    NO_EMAIL: 'La facture n\'a pas d\'adresse email client',
  },
  MEDIA: {
    LIST_FAILED: 'Échec de la liste des fichiers multimédias',
    NO_FILE: 'Aucun fichier téléchargé',
    UPLOAD_FAILED: 'Échec du téléchargement du fichier',
    NOT_FOUND: 'Fichier non trouvé',
    DELETE_FAILED: 'Échec de la suppression du fichier',
    INVALID_ID: 'Identifiant invalide',
  },
  SYSTEM: {
    LOAD_SETTINGS_FAILED: 'Échec du chargement des paramètres',
    UPDATE_SETTINGS_FAILED: 'Échec de la mise à jour des paramètres',
    SMTP_CONFIG_REQUIRED: 'L\'hôte, le port et l\'utilisateur sont requis',
    SMTP_TEST_FAILED: 'Échec de la connexion SMTP',
    DB_MIGRATION_FAILED: 'Échec de la migration de la base de données',
  },
  LEGAL: {
    NOT_FOUND: 'Pages légales non trouvées',
    PAGE_NOT_FOUND: 'Page légale non trouvée',
    INVALID_DATA: 'Données de page invalides',
    UPDATE_FAILED: 'Échec de la mise à jour de la page légale',
  },
  GENERAL: {
    INTERNAL_ERROR: 'Une erreur interne est survenue',
    NOT_FOUND: 'Ressource non trouvée',
    BAD_REQUEST: 'Requête invalide',
  }
};
