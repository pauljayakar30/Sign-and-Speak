# Railway/Render/PythonAnywhere deployment config for Flask ML API
# Using 2 workers with 120s timeout for model loading
web: cd ml_training && gunicorn -w 2 -b 0.0.0.0:$PORT --timeout 120 --preload prediction_api:app
