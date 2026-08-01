from flask import jsonify
from utils.response import error_response
from werkzeug.exceptions import HTTPException

class APIException(Exception):
    """Base API Exception for structured JSON errors."""
    status_code = 500
    message = "An unexpected error occurred."

    def __init__(self, message=None, status_code=None, details=None):
        super().__init__()
        if message is not None:
            self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.details = details

class NotFoundException(APIException):
    """404 Exception mapping."""
    status_code = 404
    message = "Resource not found."

class UnauthorizedException(APIException):
    """401 Exception mapping."""
    status_code = 401
    message = "Unauthorized access."

class ForbiddenException(APIException):
    """403 Exception mapping."""
    status_code = 403
    message = "Access forbidden."

class ValidationException(APIException):
    """400 Exception mapping."""
    status_code = 400
    message = "Validation failed."

def register_error_handlers(app):
    """Registers unified error mapping hooks onto the Flask app."""
    
    @app.errorhandler(APIException)
    def handle_api_exception(error):
        return error_response(error.message, error.details, error.status_code)

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        return error_response(error.description, None, error.code)

    @app.errorhandler(Exception)
    def handle_generic_exception(error):
        from utils.logger import logger
        logger.exception(f"Unhandled server exception: {str(error)}")
        return error_response("An internal server error occurred.", None, 500)
