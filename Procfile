# Railway/Render/PythonAnywhere deployment config for Flask ML API
web: cd ml_training && gunicorn -w 4 -b 0.0.0.0:$PORT prediction_api:app
