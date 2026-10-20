from fastapi import APIRouter
from app.api.endpoints import auth, foods, packaging, recommendations, comparison, guides, feedback, admin

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(foods.router)
api_router.include_router(packaging.router)
api_router.include_router(recommendations.router)
api_router.include_router(comparison.router)
api_router.include_router(guides.router)
api_router.include_router(feedback.router)
api_router.include_router(admin.router)
