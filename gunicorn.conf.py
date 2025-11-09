import multiprocessing

# Gunicorn configuration file
bind = "0.0.0.0:8000"

# Number of worker processes
workers = multiprocessing.cpu_count() * 2 + 1

# Worker class
worker_class = "sync"

# Timeout for worker processes
timeout = 30

# Maximum number of requests a worker will process before restarting
max_requests = 1000
max_requests_jitter = 50

# Log level
loglevel = "info"

# Access log format
accesslog = "-"
access_log_format = '%({x-real-ip}i)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Error log
errorlog = "-"

# Process name
proc_name = "money_manager"

# Preload app for better performance
preload_app = True

# SSL configuration (uncomment and configure if using HTTPS)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"