#!/bin/bash
set -e

echo "🔍 Vérification des dépendances..."

# Vérifier si package-lock.json existe
if [ -f package-lock.json ]; then
    echo "📦 package-lock.json trouvé, tentative d'installation avec npm ci..."
    
    # Essayer npm ci d'abord
    if npm ci; then
        echo "✅ Installation réussie avec npm ci"
    else
        echo "⚠️  npm ci échoué, régénération du package-lock.json..."
        echo "🔄 Suppression de l'ancien package-lock.json..."
        rm -f package-lock.json
        echo "📥 Installation avec npm install..."
        npm install
        echo "✅ Installation réussie avec npm install"
    fi
else
    echo "📦 Pas de package-lock.json, installation avec npm install..."
    npm install
    echo "✅ Installation réussie avec npm install"
fi

echo "🎉 Installation des dépendances terminée !"
