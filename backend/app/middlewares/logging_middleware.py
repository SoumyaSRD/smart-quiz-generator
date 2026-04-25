import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Configure basic logging to see interceptor output in console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("BrainWave_Interceptor")

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Enterprise-level Request Interceptor.
    Tracks every incoming request and outgoing response to monitor performance and health.
    """
    
    async def dispatch(self, request: Request, call_next):
        """
        The dispatch method interceptors the request before it reaches the endpoint.
        """
        # 1. Capture the start time
        start_time = time.time()
        
        # 2. Extract basic request metadata
        method = request.method
        url = request.url.path
        
        # 3. Log the incoming request (Development tracing)
        logger.info(f"Incoming [{method}] request to {url}")
        
        # 4. Proceed to the actual endpoint logic
        try:
            response = await call_next(request)
            
            # 5. Calculate processing time
            process_time = (time.time() - start_time) * 1000  # in ms
            
            # 6. Intercept outgoing response to add performance headers
            response.headers["X-Process-Time-MS"] = str(round(process_time, 2))
            
            # 7. Log the result
            status_code = response.status_code
            logger.info(f"Completed [{method}] {url} - Status: {status_code} - Duration: {round(process_time, 2)}ms")
            
            return response
            
        except Exception as e:
            # 8. Emergency Error Interception
            logger.error(f"FATAL EXCEPTION in [{method}] {url}: {str(e)}")
            raise e
