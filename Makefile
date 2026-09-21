# -------------------------------------------------- #
#                   VARIABLES                        #
# -------------------------------------------------- #

NAME				= TheGoodCorner
BACK_CONT			= back
STRIPE_CONT			= stripe
DATABASE_CONT		= postgresql
WEB_SERVER_CONT		= webserver
SRC_DIR				= srcs
COMPOSE				= podman compose
CONF				= ./docker-compose.yml

# -------------------------------------------------- #
# 					MARKDOWN						 #
# -------------------------------------------------- #
define MARKDOWN
@if [ -f README.md ]; then \
	code --command "markdown.showPreview" README.md 2>/dev/null; \
else \
	echo "No README.md found."; \
fi
endef

# -------------------------------------------------- #
# 					COLORS							 #
# -------------------------------------------------- #

GREEN		:=	\033[1;32m
YELLOW		:=	\033[1;33m
BLUE		:=	\033[1;34m
RED			:=	\033[1;31m
BEIGE		:=	\033[1;38;5;229m
BROWN		:=	\033[0;38;5;94m
DARK_BLUE	:=	\033[0;38;5;17m
DARK_GREY	:=	\033[0;38;5;238m
RESET		:=	\033[0m

# -------------------------------------------------- #
#                   BUILD RULES                      #
# -------------------------------------------------- #

all: up launch

up:
	npm install --prefix back --no-audit --no-fund --loglevel=error
	@if [ $$(podman ps -q -f name=$(WEB_SERVER_CONT) | wc -l ) -gt 0 ]; then \
		echo -e "$(RED)TheGoodCorner is already up."; \
	else \
		if [ -f ./back/.env ]; then \
			if grep -q "TODO" ./back/.env; then \
				echo -e "$(BLUE)Please remove TODOs from ./back/.env before launching!$(RESET)"; \
				exit 1; \
			fi; \
			echo -e "$(GREEN)Project files are present, proceeding with compilation.$(RESET)"; \
		elif [ -f ../.env ]; then \
			cp ../.env ./back/; \
			echo -e "$(GREEN) .env file has been successfully copied to ./back !"; \
		elif grep -q "TODO" ./back/.env_example; then \
			echo -e "$(BLUE) There is an env.example file inside ./back folder you must fill it out and rename it to .env before launching again !";\
			exit 1; \
		else \
			echo -e "$(BLUE) If the env.example file is absent, create .env file inside ./back folder you must fill it out before launching again !";\
			exit 1; \
		fi; \
		echo -e "$(GREEN) [up] $(YELLOW)Starting $(NAME) $(RESET)"; \
		$(COMPOSE) -f $(CONF) up --build -d; \
		echo -e "$(GREEN)[DONE]$(RESET) $(NAME) is running."; \
	fi

down:
	@echo -e "$(GREEN) [DOWN] $(RED)Stopping $(NAME)... if there are volumes they stays mounted $(RESET)"
	@$(COMPOSE) -f $(CONF) down 2>/dev/null
	@echo -e "$(BLUE)[DONE]$(RESET) $(NAME) stopped."

refresh: down up
	@echo -e "\n$(BLUE)Refresh done !\n";

launch:
# 	$(MARKDOWN)
	@echo -e "\n$(BLUE)Here's a list of basic commands to get you started :$(GREEN)\n";
	@echo -e "- docker compose -f ./srcs/docker-compose.yaml ps ([service name])";
	@echo -e "- docker compose -f ./srcs/docker-compose.yaml logs -f ([service name]) $(RESET)\n";

clean:
	@echo -e "$(YELLOW)Cleaning Docker system...$(RESET)";
	@$(COMPOSE) -f $(CONF) down -v --remove-orphans >/dev/null 2>&1 || true;
	@podman rm -fa >/dev/null 2>&1 || true;
	@podman system prune -a --volumes -f >/dev/null 2>&1 || true;
	@echo -e "$(BLUE)[DONE]$(RESET) Full clean complete.";

re: clean all

stripe:

	@if [ $$(podman ps -q -f name=stripe | wc -l ) -gt 0 ]; then \
		echo -e "$(RED)stripe container is already up refreshing. $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d --build --force-recreate $(STRIPE_CONT) 2>/dev/null; \
	else \
		echo -e "$(YELLOW)Starting $(STRIPE_CONT) $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d $(STRIPE_CONT) 2>/dev/null; \
	fi

back:

	@if [ $$(podman ps -q -f name=back | wc -l ) -gt 0 ]; then \
		echo -e "$(RED)back container is already up refreshing. $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d --build --force-recreate $(BACK_CONT) 2>/dev/null; \
	else \
		echo -e "$(YELLOW)Starting $(BACK_CONT) $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d $(BACK_CONT) 2>/dev/null; \
		echo -e "$(GREEN)[DONE]$(RESET) $(BACK_CONT) is running."; \
	fi
postgresql:

	@if [ $$(podman ps -q -f name=postgresql | wc -l ) -gt 0 ]; then \
		echo -e "$(RED)database container is already up refreshing. $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d --build --force-recreate $(DATABASE_CONT) 2>/dev/null; \
	else \
		echo -e "$(YELLOW)Starting $(DATABASE_CONT) $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d $(DATABASE_CONT) 2>/dev/null; \
		echo -e "$(GREEN)[DONE]$(RESET) $(DATABASE_CONT) is running."; \
	fi
webserver:

	@if [ $$(podman ps -q -f name=webserver | wc -l ) -gt 0 ]; then \
		echo -e "$(RED)webserver container is already up refreshing. $(RESET)"; \
		$(COMPOSE) -f $(CONF) up -d --build --force-recreate $(WEB_SERVER_CONT) 2>/dev/null; \
	else \
		echo -e "$(YELLOW)Starting $(WEB_SERVER_CONT) $(RESET)"; \
			$(COMPOSE) -f $(CONF) up -d $(WEB_SERVER_CONT) 2>/dev/null; \
		echo -e "$(GREEN)[DONE]$(RESET) $(WEB_SERVER_CONT) is running."; \
	fi

studio:
	@set -a; . ./back/.env; set +a; \
	DATABASE_URL=$$(printf '%s' "$$DATABASE_URL" | sed 's/@postgresql:/@localhost:/') \
	npm --prefix back run db:studio

.PHONY: all up down back database webserver stripe clean re studio