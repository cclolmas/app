# Import the cognitive load router
from .routes import cognitive_load

# In the app setup section, include the cognitive load router
app.include_router(cognitive_load.router)