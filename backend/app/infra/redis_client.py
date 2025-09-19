from typing import Optional
from redis import Redis
from redis.exceptions import RedisError
from app.config import REDIS_URL

_client: Optional[Redis] = None

def get_redis() -> Optional[Redis]:
    global _client
    if not REDIS_URL:
        return None
    if _client is None:
        _client = Redis.from_url(REDIS_URL, decode_responses=True)
    return _client

def safe_get(key: str) -> Optional[str]:
    r = get_redis()
    if not r:
        return None
    try:
        return r.get(key)
    except RedisError:
        return None

def safe_set(key: str, value: str, ex: int = 3600) -> None:
    r = get_redis()
    if not r:
        return
    try:
        r.set(key, value, ex=ex)
    except RedisError:
        pass
