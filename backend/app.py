
"""Configures the app and runs the server."""

#!/usr/bin/env python

#-----------------------------------------------------------------------
# runserver.py
#-----------------------------------------------------------------------

import os, dotenv
dotenv.load_dotenv()

#-----------------------------------------------------------------------

from flask import Flask
from flask_cors import CORS
from routes import main, auth_bp, community

#-----------------------------------------------------------------------

def create_app():
    app = Flask(__name__)
    # TODO needs dynamic adjustment
    CORS(app, origins=["http://localhost:3003"])
    app.secret_key = os.environ['APP_SECRET_KEY']
    
    # ignore; USE ONLY FOR STRESS TESTING
    # app.config["TESTING_BYPASS_AUTH"] = True

    app.register_blueprint(main)
    app.register_blueprint(auth_bp)
    app.register_blueprint(community)

    return app
    
app = create_app()
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5010, debug=True)
