from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from services.search_service import fast_search
from services.recommendation_service import get_product_recommendations
from services.user_activity import activity_cache


router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    mode: str = "text"
    limit: int = 50
    use_mmr: bool = True
    lambda_: float = 0.6
    budget_limit: Optional[float] = None
    user_id: str = "anonymous"  # Default user ID
    
class DescriptionRequest(BaseModel):
    description: str

def parse_price(price_str: str) -> Optional[float]:
    """
    Parse price string safely.
    Handles formats: "$100", "$1,299.99", "100", etc.
    Returns None if parsing fails.
    """
    if not price_str or price_str == "Price on request":
        return None
    
    try:
        # Remove $ and commas, convert to float
        cleaned = str(price_str).replace("$", "").replace(",", "").strip()
        return float(cleaned)
    except (ValueError, AttributeError):
        return None



    
@router.post("/search")
def search(data: SearchRequest):
    """Search endpoint with MMR support and budget filtering"""
    print(f"Received search request: query='{data.query}', mode={data.mode}, budget={data.budget_limit}")
    
    # Track search query
    activity_cache.add_search_query(
        user_id=data.user_id,
        query=data.query,
        mode=data.mode,
        budget=data.budget_limit
    )
    
    results = fast_search(
        query_data=data.query,
        mode=data.mode,
        limit=data.limit,
        use_mmr=data.use_mmr,
        lambda_=data.lambda_
    )
    
    # Apply budget range filter if specified [50% - 100% of budget]
    if data.budget_limit:
        min_budget = data.budget_limit * 0.5  # 50% of budget limit
        max_budget = data.budget_limit         # 100% of budget limit
        filtered_results = []
        
        for result in results:
            # Parse price safely (handles commas and $ signs)
            price = parse_price(result.get("price", ""))
            
            if price is None:
                print(f"⚠️ Skipping result with invalid price: {result.get('price')}")
                continue
            
            # Check if price is in budget range
            if min_budget <= price <= max_budget:
                filtered_results.append(result)
        
        results = filtered_results
        print(f"Budget filter applied: ${min_budget:.2f} - ${max_budget:.2f}, {len(results)} results after filtering")
    
    # Track viewed products
    activity_cache.add_viewed_products(user_id=data.user_id, products=results)
    
    return results

@router.post("/recommendations")
def recommend(req: DescriptionRequest):
    return get_product_recommendations(req.description)

@router.get("/user-activity/{user_id}")
def get_user_activity(user_id: str):
    """
    Get complete user activity context including:
    - Recent searches
    - Viewed products
    - Top interacted products
    """
    context = activity_cache.get_user_context(user_id)
    return context

@router.get("/search-history/{user_id}")
def get_search_history(user_id: str, limit: int = 20):
    """Get user's search history"""
    history = activity_cache.get_search_history(user_id, limit=limit)
    return {"user_id": user_id, "searches": history, "count": len(history)}

@router.get("/viewed-products/{user_id}")
def get_viewed_products(user_id: str, limit: int = 20):
    """Get user's viewed products"""
    products = activity_cache.get_viewed_products(user_id, limit=limit)
    return {"user_id": user_id, "products": products, "count": len(products)}

@router.delete("/user-activity/{user_id}")
def clear_user_activity(user_id: str):
    """Clear all activity data for a user"""
    activity_cache.clear_user_data(user_id)
    return {"message": f"Activity data cleared for user {user_id}"}