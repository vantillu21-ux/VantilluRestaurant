import os
import logging
from logging.handlers import RotatingFileHandler

# Resolve logs directory path dynamically (backend/logs)
backend_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
logs_dir = os.path.join(backend_root, 'logs')

try:
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
except Exception as e:
    print(f"Warning: Could not create logs directory: {e}")

def setup_logger(name, log_file, level=logging.INFO):
    """Factory function to build standard logging components."""
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Prevent handler duplication when imports run multiple times
    if not logger.handlers:
        # File Handler (rotating file blocks of 5MB, keeping up to 3 archives)
        try:
            file_path = os.path.join(logs_dir, log_file)
            file_handler = RotatingFileHandler(file_path, maxBytes=5*1024*1024, backupCount=3)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        except Exception as e:
            print(f"Warning: Could not configure file handler for {log_file}: {e}")
            
        # Stream Handler (Standard Console Output)
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
        
    # Prevent propagation to avoid double logging issues
    logger.propagate = False
    return logger

# Export standard logger instances
logger = setup_logger('backend', 'backend.log')
payment_logger = setup_logger('payment', 'payment.log')
audit_logger = setup_logger('audit', 'audit.log')
