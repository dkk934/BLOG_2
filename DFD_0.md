```mermaid
graph TD
    %% External Entity (User)
    User((User))
    
    %% Process (System)
    Process[Blog and Login System]
    
    %% Data Stores (Tables)
    DS1[(users_login Table)]
    DS2[(home Table)]
    DS3[(categories Table)]
    
    %% Data Flow
    User -->|Register/Login| Process
    User -->|Create/Read Blog Posts| Process
    User -->|Manage Categories| Process
    
    Process -->|Store/Verify Credentials| DS1
    Process -->|Save/Fetch Blog Posts| DS2
    Process -->|Assign/Fetch Categories| DS3
