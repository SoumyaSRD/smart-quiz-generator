from app.core.security import pwd_context

# High-level Mock Database Simulation
# In a production environment, this would be a SQL/NoSQL connection.
users_db = {
    "admin@example.com": {
        "username": "admin@example.com",
        "full_name": "Admin User",
        "hashed_password": pwd_context.hash("admin123"),
        "disabled": False,
        "role": "admin"
    }
}
