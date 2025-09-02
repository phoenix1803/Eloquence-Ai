from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer
import uuid
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Eloquence-AI RAG Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models and clients
try:
    # Use a lightweight, fast model for embeddings
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    # Initialize Qdrant client
    qdrant_url = os.getenv('QDRANT_URL', 'http://localhost:6333')
    qdrant_api_key = os.getenv('QDRANT_API_KEY')
    
    if qdrant_api_key:
        client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    else:
        client = QdrantClient(url=qdrant_url)
    
    # Collection name
    COLLECTION_NAME = "eloquence_knowledge"
    
    # Create collection if it doesn't exist
    try:
        client.get_collection(COLLECTION_NAME)
        logger.info(f"Collection {COLLECTION_NAME} already exists")
    except:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE),
        )
        logger.info(f"Created collection {COLLECTION_NAME}")
        
except Exception as e:
    logger.error(f"Initialization error: {e}")
    raise

# Pydantic models
class Document(BaseModel):
    id: Optional[str] = None
    content: str
    metadata: Dict[str, Any]

class SearchRequest(BaseModel):
    query: str
    limit: int = 5
    threshold: float = 0.7

class SearchResult(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResult]

@app.get("/")
async def root():
    return {"message": "Eloquence-AI RAG Service is running"}

@app.get("/health")
async def health_check():
    try:
        # Test Qdrant connection
        collections = client.get_collections()
        return {
            "status": "healthy",
            "qdrant_connected": True,
            "collections": len(collections.collections),
            "model_loaded": model is not None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/add", response_model=Dict[str, str])
async def add_document(document: Document):
    try:
        # Generate ID if not provided
        if not document.id:
            document.id = str(uuid.uuid4())
        
        # Generate embedding
        embedding = model.encode(document.content).tolist()
        
        # Add timestamp if not in metadata
        if 'timestamp' not in document.metadata:
            document.metadata['timestamp'] = datetime.now().isoformat()
        
        # Create point
        point = PointStruct(
            id=document.id,
            vector=embedding,
            payload={
                "content": document.content,
                "metadata": document.metadata
            }
        )
        
        # Upsert to Qdrant
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=[point]
        )
        
        logger.info(f"Added document {document.id}")
        return {"status": "success", "id": document.id}
        
    except Exception as e:
        logger.error(f"Error adding document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse)
async def search_documents(request: SearchRequest):
    try:
        # Generate query embedding
        query_embedding = model.encode(request.query).tolist()
        
        # Search in Qdrant
        search_results = client.search(
            collection_name=COLLECTION_NAME,
            query_vector=query_embedding,
            limit=request.limit,
            score_threshold=request.threshold
        )
        
        # Format results
        results = []
        for result in search_results:
            results.append(SearchResult(
                id=str(result.id),
                content=result.payload["content"],
                metadata=result.payload["metadata"],
                score=result.score
            ))
        
        logger.info(f"Search for '{request.query}' returned {len(results)} results")
        return SearchResponse(results=results)
        
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/recent")
async def get_recent_documents(limit: int = 10):
    try:
        # Get recent documents by scrolling
        scroll_result = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=limit,
            with_payload=True,
            with_vectors=False
        )
        
        documents = []
        for point in scroll_result[0]:
            documents.append({
                "id": str(point.id),
                "content": point.payload["content"],
                "metadata": point.payload["metadata"]
            })
        
        # Sort by timestamp if available
        documents.sort(
            key=lambda x: x["metadata"].get("timestamp", ""),
            reverse=True
        )
        
        return {"documents": documents[:limit]}
        
    except Exception as e:
        logger.error(f"Error fetching recent documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    try:
        client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=[document_id]
        )
        
        logger.info(f"Deleted document {document_id}")
        return {"status": "success", "deleted_id": document_id}
        
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_collection_stats():
    try:
        collection_info = client.get_collection(COLLECTION_NAME)
        return {
            "collection_name": COLLECTION_NAME,
            "points_count": collection_info.points_count,
            "vectors_count": collection_info.vectors_count,
            "status": collection_info.status
        }
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)