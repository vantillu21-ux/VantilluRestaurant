from flask import jsonify

def success_response(message, data=None, status_code=200):
    """Generates standard success JSON payload."""
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
        
    return jsonify(response), status_code

def error_response(message, errors=None, status_code=400):
    """Generates standard failure/error JSON payload."""
    response = {
        "success": False,
        "message": message
    }
    if errors is not None:
        response["errors"] = errors
        
    return jsonify(response), status_code
