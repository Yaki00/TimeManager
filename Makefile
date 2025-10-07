# ===== Makefile =====
# Chaque ligne de commande doit commencer par une tabulation (\t)
# Ne pas utiliser d'espaces

up: ## Démarre docker compose (mode interactif)
	docker compose up

up-d: ## Démarre en arrière-plan (detached)
	docker compose up -d

down: ## Stoppe les conteneurs
	docker compose down

build: ## Reconstruit le backend sans cache
	docker compose build --no-cache backend

logs: ## Affiche les logs du backend
	docker compose logs -f backend

shell: ## Ouvre un shell dans le conteneur backend
	docker compose exec backend sh
