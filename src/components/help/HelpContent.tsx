// ============================================
// 📖 CONTENU D'AIDE - HOTELMANAGER
// Version FRANÇAIS uniquement
// ============================================

export interface HelpContentItem {
  subtitle?: string;
  text?: string;
  steps?: string[];
  bullets?: string[];
  note?: string;
  warning?: string;
  image?: string;
  imageAlt?: string;
}

export interface HelpSection {
  icon: string;
  title: string;
  content: HelpContentItem[];
}

export interface PageHelpContent {
  title: string;
  description: string;
  sections: HelpSection[];
}

export interface HelpContent {
  [pageId: string]: PageHelpContent;
}

// ============================================
// CONTENU POUR CHAQUE PAGE
// ============================================

export const helpContent: HelpContent = {
  // ============================================
  // PAGE: COMPTES CLIENTS
  // ============================================
  comptes: {
    title: "💰 Comptes Clients",
    description: "Cette page vous permet de gérer les comptes de vos clients : voir leurs consommations, enregistrer leurs paiements et suivre leur solde en temps réel.",
    sections: [
      {
        icon: "➕",
        title: "Comment ajouter une consommation ?",
        content: [
          {
            text: "Quand un client prend quelque chose (minibar, restaurant, etc.), vous devez l'ajouter à son compte :",
            steps: [
              "Trouvez le client dans la liste des comptes ouverts",
              "Cliquez sur le bouton '➕ Ajouter consommation'",
              "Sélectionnez le type en cliquant sur l'icône (🍺 Minibar, 🍽️ Restaurant, etc.)",
              "Utilisez la calculatrice pour saisir le montant rapidement",
              "Ajoutez une description si besoin (ex: '2 bières + chips')",
              "Cliquez sur '✅ AJOUTER AU COMPTE'"
            ],
            note: "Le montant s'ajoute automatiquement au total facturé et au solde du client. Vous n'avez rien à calculer !"
          },
          {
            subtitle: "Utiliser la calculatrice",
            text: "La calculatrice vous permet de saisir un montant en 2 clics :",
            bullets: [
              "Cliquez sur les chiffres pour composer le montant",
              "Utilisez les boutons rapides (1 000 Ar, 5 000 Ar, etc.) pour aller plus vite",
              "Le bouton '00' permet d'ajouter deux zéros d'un coup",
              "Le bouton '⌫' efface le dernier chiffre"
            ]
          }
        ]
      },
      {
        icon: "💰",
        title: "Comment encaisser un paiement ?",
        content: [
          {
            text: "Quand un client paie (en partie ou totalement) :",
            steps: [
              "Cliquez sur le bouton '💰 Encaisser'",
              "Saisissez le montant payé avec la calculatrice",
              "Ou utilisez les boutons % : 25%, 50%, 75% ou 100% du total",
              "Choisissez la méthode de paiement : 💵 Espèces, 💳 Carte Bancaire, 📱 Mobile Money, ou 🏦 Virement",
              "Ajoutez une référence si nécessaire (ex: numéro de transaction)",
              "Ajoutez une remarque si besoin (ex: 'Paiement partiel 1/3')",
              "Cliquez sur '✅ ENCAISSER'"
            ]
          },
          {
            subtitle: "Paiements multiples",
            text: "Un client peut payer petit à petit, en plusieurs fois. C'est très courant !",
            bullets: [
              "Le solde se met à jour automatiquement après chaque paiement",
              "Vous pouvez voir l'historique de tous les paiements dans les détails du compte",
              "Quand le solde atteint 0, le compte est automatiquement marqué comme 'Soldé'"
            ],
            note: "Le nouveau solde est affiché avant de valider, pour éviter les erreurs"
          },
          {
            subtitle: "Boutons rapides de pourcentage",
            text: "Les boutons % permettent de saisir rapidement une fraction du total :",
            bullets: [
              "[25%] : Le client paie un quart du total",
              "[50%] : Le client paie la moitié",
              "[75%] : Le client paie les trois quarts",
              "[100% TOTAL] : Le client solde complètement son compte"
            ],
            note: "Ces boutons sont très pratiques quand plusieurs personnes partagent une chambre"
          }
        ]
      },
      {
        icon: "👁️",
        title: "Comment voir les détails d'un compte ?",
        content: [
          {
            text: "Pour voir l'historique complet d'un client :",
            steps: [
              "Cliquez sur le bouton '👁️ Détails'",
              "Le panneau s'ouvre avec toutes les informations",
              "En haut : le solde actuel (en gros !)",
              "L'historique jour par jour de toutes les consommations",
              "La liste de tous les paiements reçus"
            ]
          },
          {
            subtitle: "Comprendre l'historique",
            text: "L'historique est organisé par date pour faciliter la lecture :",
            bullets: [
              "Chaque jour a sa propre section",
              "Les consommations sont en gris avec leur icône (🍺, 🍽️, etc.)",
              "Les paiements sont en vert avec ✅",
              "Vous voyez immédiatement ce qui a été ajouté et ce qui a été payé"
            ],
            note: "L'historique est en lecture seule. Pour modifier, utilisez les boutons 'Ajouter' et 'Encaisser'"
          }
        ]
      },
      {
        icon: "⚠️",
        title: "Comprendre les statuts",
        content: [
          {
            text: "Un compte peut avoir 3 statuts différents :",
            bullets: [
              "🏨 Ouvert : Le client est en chambre et a des consommations",
              "✅ Soldé : Le client a tout payé, le compte est à zéro",
              "🔴 Dette : Le client est parti sans tout payer"
            ]
          },
          {
            subtitle: "Attention au check-out",
            warning: "Un client ne peut PAS faire de check-out s'il a encore un solde à payer. Le système le bloquera automatiquement.",
            text: "Si le client veut partir sans payer :",
            steps: [
              "Le système affiche 'Reste à payer : XX Ar'",
              "Vous avez 2 choix : '💰 Il paie maintenant' ou '📋 Il payera plus tard'",
              "Si vous choisissez 'plus tard', une dette est créée avec une alerte automatique",
              "Le client pourra partir mais son compte restera en 'Dette'"
            ]
          }
        ]
      },
      {
        icon: "🔍",
        title: "Rechercher un client rapidement",
        content: [
          {
            text: "Utilisez la barre de recherche en haut de la page pour trouver un client :",
            bullets: [
              "Tapez son nom",
              "Tapez le numéro de chambre (ex: '101')",
              "La liste se filtre automatiquement"
            ],
            note: "La recherche fonctionne même avec quelques lettres seulement. Tapez 'pie' pour trouver 'Pierre'."
          }
        ]
      },
      {
        icon: "🖨️",
        title: "Imprimer un relevé de compte",
        content: [
          {
            text: "Pour donner un relevé au client :",
            steps: [
              "Ouvrez les détails du compte",
              "Cliquez sur '🖨️ Imprimer relevé' en bas",
              "Le relevé PDF se génère avec tout l'historique"
            ],
            note: "Utile si le client veut vérifier ses dépenses avant de payer"
          }
        ]
      }
    ]
  },

  // ============================================
  // PAGE: RÉSERVATIONS
  // ============================================
  reservations: {
    title: "📅 Réservations",
    description: "Gérez toutes les réservations de votre hôtel : créer, modifier, faire les check-in et check-out.",
    sections: [
      {
        icon: "➕",
        title: "Créer une nouvelle réservation",
        content: [
          {
            steps: [
              "Cliquez sur le bouton '+ Nouvelle réservation'",
              "Sélectionnez le client dans la liste (ou créez-en un nouveau)",
              "Choisissez la chambre disponible",
              "Indiquez la date d'arrivée prévue",
              "Indiquez la date de départ prévue",
              "Le prix total est calculé automatiquement (nombre de nuits × prix chambre)",
              "Ajoutez un acompte si le client paie d'avance (optionnel)",
              "Ajoutez une remarque si nécessaire",
              "Cliquez sur 'Créer la réservation'"
            ],
            note: "L'acompte sera automatiquement enregistré comme premier paiement lors du check-in"
          },
          {
            subtitle: "Choisir la bonne chambre",
            text: "Le système vous montre uniquement les chambres disponibles pour les dates choisies.",
            warning: "Vérifiez bien que la chambre correspond aux besoins du client (nombre de lits, etc.)"
          }
        ]
      },
      {
        icon: "🏨",
        title: "Faire un check-in",
        content: [
          {
            text: "Quand le client arrive à l'hôtel :",
            steps: [
              "Trouvez sa réservation dans la liste",
              "Cliquez sur le bouton '🏨 Check-in'",
              "Un compte client est créé automatiquement",
              "Les nuitées sont ajoutées au compte (une par nuit)",
              "L'acompte est enregistré comme paiement s'il y en a un",
              "La chambre passe en statut 'Occupée'",
              "La réservation passe en statut 'En cours'"
            ],
            note: "Tout est automatique ! Vous n'avez qu'à cliquer sur le bouton."
          },
          {
            subtitle: "Alertes automatiques",
            text: "Si le client a des notes importantes (dettes passées, préférences spéciales, etc.), une alerte s'affichera automatiquement au moment du check-in.",
            warning: "Prenez le temps de lire les alertes avant d'accueillir le client. Cela peut contenir des informations cruciales."
          },
          {
            subtitle: "Vérifications avant check-in",
            bullets: [
              "La chambre est-elle bien propre et prête ?",
              "Avez-vous les clés de la chambre ?",
              "Le client a-t-il des demandes spéciales ?"
            ]
          }
        ]
      },
      {
        icon: "🚪",
        title: "Faire un check-out",
        content: [
          {
            text: "Quand le client part de l'hôtel :",
            steps: [
              "Trouvez sa réservation dans la liste",
              "Vérifiez d'abord la chambre (minibar, dégâts, etc.)",
              "Ajoutez les éventuels frais supplémentaires au compte",
              "Cliquez sur '🚪 Check-out'",
              "Le système vérifie automatiquement si tout est payé"
            ]
          },
          {
            subtitle: "Si le client a tout payé",
            steps: [
              "Le check-out est validé immédiatement",
              "La chambre passe en statut 'Sale'",
              "La réservation passe en statut 'Terminée'",
              "Le compte est marqué 'Soldé'",
              "Vous pouvez proposer d'imprimer la facture"
            ],
            note: "Le service de ménage voit que la chambre est à nettoyer"
          },
          {
            subtitle: "Si le client n'a pas tout payé",
            text: "Le système bloque le check-out et affiche : ⚠️ Reste à payer : XX Ar",
            bullets: [
              "Option 1 : '💰 Il paie maintenant' → Ouvre la fenêtre d'encaissement",
              "Option 2 : '📋 Il payera plus tard' → Crée une dette avec alerte automatique",
              "Option 3 : 'Annuler' → Retour sans check-out"
            ],
            warning: "Si vous créez une dette, une note importante sera ajoutée au client avec une alerte qui s'affichera à sa prochaine visite !"
          },
          {
            subtitle: "Inspection de la chambre",
            text: "Avant le check-out, inspectez toujours la chambre pour :",
            bullets: [
              "Vérifier le minibar (ajouter les consommations au compte)",
              "Vérifier s'il n'y a pas de dégâts",
              "Récupérer la clé",
              "Vérifier que rien n'a été oublié"
            ],
            note: "Mieux vaut vérifier avant le départ du client qu'après !"
          }
        ]
      },
      {
        icon: "✏️",
        title: "Modifier une réservation",
        content: [
          {
            text: "Pour modifier les dates ou la chambre d'une réservation :",
            steps: [
              "Cliquez sur '✏️ Modifier' sur la ligne de la réservation",
              "Changez les informations nécessaires",
              "Validez les modifications"
            ],
            warning: "Attention : Si vous changez les dates d'une réservation déjà en check-in, les nuitées du compte seront recalculées !"
          }
        ]
      },
      {
        icon: "❌",
        title: "Annuler une réservation",
        content: [
          {
            text: "Si le client annule sa réservation :",
            steps: [
              "Cliquez sur 'Annuler' sur la ligne de la réservation",
              "Confirmez l'annulation",
              "La chambre redevient disponible",
              "La réservation passe en statut 'Annulée'"
            ],
            note: "Les réservations annulées restent dans l'historique mais ne sont plus visibles dans la liste principale"
          },
          {
            subtitle: "Gestion de l'acompte",
            text: "Si le client avait payé un acompte :",
            bullets: [
              "Décidez si vous remboursez ou non selon votre politique",
              "Notez la décision dans les remarques",
              "Enregistrez le remboursement si nécessaire"
            ]
          }
        ]
      }
    ]
  },

  // ============================================
  // PAGE: CLIENTS
  // ============================================
  clients: {
    title: "👥 Clients",
    description: "Base de données de tous vos clients avec leur historique complet de séjours.",
    sections: [
      {
        icon: "➕",
        title: "Ajouter un nouveau client",
        content: [
          {
            steps: [
              "Cliquez sur le bouton '+ Nouveau client'",
              "Remplissez les informations obligatoires : Nom",
              "Ajoutez l'email si disponible (recommandé)",
              "Ajoutez le téléphone (recommandé)",
              "Ajoutez l'adresse si besoin",
              "Cliquez sur 'Créer le client'"
            ],
            note: "Plus vous avez d'informations sur un client, plus facile sera la gestion et la communication"
          },
          {
            subtitle: "Informations importantes",
            bullets: [
              "Le nom est obligatoire",
              "L'email permet d'envoyer des confirmations (si vous avez cette fonction)",
              "Le téléphone permet de contacter le client rapidement",
              "L'adresse peut être utile pour la facturation"
            ]
          }
        ]
      },
      {
        icon: "📋",
        title: "Voir l'historique d'un client",
        content: [
          {
            text: "Pour voir tous les séjours passés d'un client :",
            steps: [
              "Cliquez sur le bouton 'Historique' sur la ligne du client",
              "Une fenêtre s'ouvre avec toutes les informations"
            ]
          },
          {
            subtitle: "Ce que vous verrez dans l'historique",
            bullets: [
              "📊 Statistiques globales : nombre total de séjours, argent total dépensé, dettes éventuelles",
              "📅 Liste de tous les séjours avec dates, chambre, montants",
              "💰 Statut de chaque séjour (Soldé, Dette, etc.)",
              "📝 Toutes les notes concernant ce client"
            ],
            note: "L'historique vous permet d'identifier rapidement les bons clients (beaucoup de séjours) et les clients à problèmes (dettes)"
          }
        ]
      },
      {
        icon: "📝",
        title: "Ajouter une note sur un client",
        content: [
          {
            text: "Les notes permettent de mémoriser des informations importantes sur un client :",
            steps: [
              "Cliquez sur le bouton notes (📌) du client",
              "Cliquez sur '+ Nouvelle note'",
              "Choisissez le type de note",
              "Donnez un titre à la note",
              "Écrivez le contenu de la note",
              "Cochez 'Alerter au prochain check-in' si c'est important",
              "Validez"
            ]
          },
          {
            subtitle: "Les 3 types de notes",
            bullets: [
              "⚠️ Important : Dettes, problèmes passés, interdictions, informations critiques",
              "❤️ Préférence : Chambre favorite, allergies alimentaires, demandes spéciales",
              "ℹ️ Info : Informations générales, remarques diverses"
            ]
          },
          {
            subtitle: "L'alerte au check-in",
            text: "Si vous cochez 'Alerter au prochain check-in', la note s'affichera automatiquement en popup quand le client reviendra.",
            warning: "Utilisez cette fonction uniquement pour les informations vraiment importantes ! Ne pas en abuser."
          },
          {
            subtitle: "Exemples de notes utiles",
            bullets: [
              "⚠️ 'Dette de 50 000 Ar depuis juin 2024'",
              "❤️ 'Préfère la chambre 205, allergie aux arachides'",
              "ℹ️ 'Client régulier depuis 2020, très satisfait du service'"
            ]
          }
        ]
      },
      {
        icon: "🔍",
        title: "Rechercher un client",
        content: [
          {
            text: "Utilisez la barre de recherche pour trouver rapidement un client :",
            bullets: [
              "Tapez son nom (même partiellement)",
              "Tapez son email",
              "Tapez son numéro de téléphone"
            ],
            note: "La recherche est instantanée et fonctionne même avec quelques lettres. Tapez 'jean' pour trouver tous les 'Jean', 'Jeanne', 'Jeannot', etc."
          }
        ]
      },
      {
        icon: "📊",
        title: "Comprendre les statistiques client",
        content: [
          {
            text: "Chaque client affiche des statistiques importantes :",
            bullets: [
              "🏨 Séjours : Nombre total de fois où le client est venu",
              "💰 Total dépensé : Somme de tout l'argent qu'il a dépensé chez vous",
              "🔴 Doit : Argent qu'il doit encore (dettes en cours)"
            ]
          },
          {
            subtitle: "Les badges clients",
            bullets: [
              "🔴 Badge rouge : Le client a une dette en cours",
              "📌 Badge note : Le client a des notes importantes"
            ],
            note: "Ces badges permettent d'identifier visuellement les clients qui nécessitent une attention particulière"
          }
        ]
      }
    ]
  },

  // ============================================
  // PAGE: DASHBOARD
  // ============================================
  dashboard: {
    title: "📊 Tableau de bord",
    description: "Vue d'ensemble de votre hôtel en un coup d'œil. Tous les chiffres importants sont ici !",
    sections: [
      {
        icon: "📈",
        title: "Comprendre les indicateurs (KPIs)",
        content: [
          {
            subtitle: "💰 Revenus du mois",
            text: "Montant total encaissé ce mois-ci (tous les paiements reçus).",
            bullets: [
              "Affiché en gros pour voir tout de suite comment va le mois",
              "Compare automatiquement avec le mois dernier",
              "🟢 Flèche verte si c'est mieux que le mois dernier",
              "🔴 Flèche rouge si c'est moins bien"
            ]
          },
          {
            subtitle: "🏨 Taux d'occupation",
            text: "Pourcentage de chambres occupées par rapport au total de chambres.",
            bullets: [
              "🟢 Vert si >80% : excellent !",
              "🟠 Orange si 50-80% : correct",
              "🔴 Rouge si <50% : à améliorer"
            ],
            note: "Un bon taux d'occupation montre que votre hôtel est attractif et bien rempli"
          },
          {
            subtitle: "⚠️ Comptes ouverts",
            text: "Nombre de clients actuellement en chambre avec un compte actif.",
            bullets: [
              "Montre combien de clients sont dans l'hôtel en ce moment",
              "Affiche le montant total à recevoir (somme de tous les soldes)",
              "Cliquez sur [VOIR LES COMPTES →] pour aller directement à la page Comptes"
            ],
            warning: "Surveillez régulièrement qu'il n'y a pas de comptes avec des soldes trop élevés. Encouragez les paiements réguliers !"
          }
        ]
      },
      {
        icon: "📅",
        title: "Réservations à venir",
        content: [
          {
            text: "Cette section montre les prochaines arrivées prévues.",
            bullets: [
              "Les réservations sont triées par date d'arrivée",
              "Vous voyez la chambre réservée",
              "Vous voyez le client",
              "Vous pouvez faire le check-in directement si le client arrive"
            ],
            note: "Vérifiez chaque matin les arrivées du jour pour préparer les chambres"
          }
        ]
      },
      {
        icon: "🔔",
        title: "Alertes et notifications",
        content: [
          {
            text: "Le tableau de bord affiche des alertes importantes :",
            bullets: [
              "🔴 Chambres à nettoyer (statut 'Sale')",
              "⚠️ Comptes avec soldes élevés",
              "📅 Check-out prévus aujourd'hui",
              "🏨 Check-in prévus aujourd'hui"
            ],
            note: "Les alertes vous aident à ne rien oublier et à anticiper le travail de la journée"
          }
        ]
      }
    ]
  },

  // ============================================
  // PAGE: CHAMBRES
  // ============================================
  chambres: {
    title: "🛏️ Chambres",
    description: "Gérez toutes les chambres de votre hôtel : disponibilité, statut, et détails.",
    sections: [
      {
        icon: "🏠",
        title: "Vue d'ensemble des chambres",
        content: [
          {
            text: "Cette page affiche toutes les chambres de votre hôtel avec leur statut actuel.",
            bullets: [
              "🟢 Disponible : Chambre prête pour un nouveau client",
              "🔴 Occupée : Client actuellement dans la chambre",
              "🟡 Sale : Chambre à nettoyer après un départ",
              "🔧 Maintenance : Chambre en réparation ou indisponible"
            ]
          }
        ]
      },
      {
        icon: "✏️",
        title: "Modifier une chambre",
        content: [
          {
            text: "Pour modifier les informations d'une chambre :",
            steps: [
              "Cliquez sur la chambre pour ouvrir ses détails",
              "Cliquez sur 'Modifier'",
              "Changez les informations (prix, type, capacité, etc.)",
              "Validez les modifications"
            ]
          }
        ]
      }
    ]
  },

  // ============================================
  // PAGE: STATISTIQUES
  // ============================================
  statistiques: {
    title: "📊 Statistiques",
    description: "Analysez les performances de votre hôtel avec des graphiques et des rapports détaillés.",
    sections: [
      {
        icon: "📈",
        title: "Comprendre les graphiques",
        content: [
          {
            text: "Les statistiques vous aident à comprendre l'activité de votre hôtel :",
            bullets: [
              "Revenus par période (jour, semaine, mois)",
              "Taux d'occupation dans le temps",
              "Répartition par type de chambre",
              "Méthodes de paiement utilisées"
            ],
            note: "Utilisez ces données pour prendre de meilleures décisions commerciales"
          }
        ]
      }
    ]
  },

  // ============================================
  // PAGE: PARAMÈTRES
  // ============================================
  parametres: {
    title: "⚙️ Paramètres",
    description: "Configurez votre hôtel, gérez les utilisateurs et personnalisez l'application.",
    sections: [
      {
        icon: "👥",
        title: "Gestion des utilisateurs",
        content: [
          {
            text: "Ajoutez et gérez les comptes utilisateurs de votre équipe :",
            bullets: [
              "Créer de nouveaux comptes pour votre équipe",
              "Définir les rôles (Admin, Réceptionniste, etc.)",
              "Activer/désactiver des comptes",
              "Réinitialiser les mots de passe"
            ]
          }
        ]
      },
      {
        icon: "🔒",
        title: "Permissions",
        content: [
          {
            text: "Contrôlez qui peut accéder à quoi :",
            bullets: [
              "Définir les pages accessibles par rôle",
              "Limiter certaines actions sensibles",
              "Protéger les données confidentielles"
            ]
          }
        ]
      }
    ]
  }
};
