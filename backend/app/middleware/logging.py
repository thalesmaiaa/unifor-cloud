import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("app")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log the incoming request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"| Client: {request.client.host if request.client else 'unknown'}"
        )

        try:
            response = await call_next(request)
            process_time = time.time() - start_time

            logger.info(
                f"Response: {request.method} {request.url.path} "
                f"| Status: {response.status_code} "
                f"| Duration: {process_time:.3f}s"
            )

            response.headers["X-Process-Time"] = str(round(process_time, 3))
            return response

        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                f"Error: {request.method} {request.url.path} "
                f"| Exception: {str(e)} "
                f"| Duration: {process_time:.3f}s"
            )
            raise
