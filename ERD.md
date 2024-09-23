```mermaid
erDiagram
    %% Entity: users_login
    users_login {
        int id PK "Primary Key"
        varchar email_address "NOT NULL, UNIQUE"
        varchar password "Hashed password, NULL for OAuth"
        varchar oauth_provider "OAuth provider (e.g., Google), NULL if local"
        varchar oauth_id "OAuth unique ID, NULL if local"
        timestamp created_at "DEFAULT CURRENT_TIMESTAMP"
        timestamp updated_at "DEFAULT CURRENT_TIMESTAMP"
    }

    %% Entity: home (Blog Posts)
    home {
        int id PK "Primary Key"
        varchar title "NOT NULL, Title of the blog post"
        text content "NOT NULL, Main content of the post"
        varchar author "NOT NULL, Author's name or email"
        timestamp time "DEFAULT CURRENT_TIMESTAMP, Time of creation"
        int category_id FK "Foreign Key to categories table, NULL if uncategorized"
        int user_id FK "Foreign Key to users_login, NULL if not linked to a user"
    }

    %% Entity: categories
    categories {
        int id PK "Primary Key"
        varchar category_name "NOT NULL, UNIQUE, Name of the category"
    }

    %% Relationships
    %% A user can write many blog posts, each post belongs to one user (1:N)
    users_login ||--o{ home : "writes"
    %% Each blog post belongs to one category, a category can have many posts (1:N)
    categories ||--o{ home : "categorizes"

    %% Additional Details for Relationships
    %% Optional foreign key linking blog posts to users (nullable user_id in home table)
    home ||--|{ users_login : "FK user_id"
    %% Optional foreign key linking blog posts to categories (nullable category_id in home table)
    home ||--|{ categories : "FK category_id"
