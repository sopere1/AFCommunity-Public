"""Defines the routes (HTTPS requests) for AFCommunity."""

#!/usr/bin/env python

#-----------------------------------------------------------------------
# routes.py
#-----------------------------------------------------------------------
# Google Drive Configuration
import io
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

#-----------------------------------------------------------------------

import json
from flask import Blueprint, jsonify, request
from shapely.geometry import shape
from shapely.ops import unary_union
from geoalchemy2.shape import from_shape
import auth
import database

#-----------------------------------------------------------------------
# Constants
ROLES = ['viewer', 'editor', 'admin']

#-----------------------------------------------------------------------

main = Blueprint('main', __name__)

@main.route("/get-markers", methods=["POST"])
def get_cameras():
    """Get all markers available to the current user."""
    try:
        auth.verify_user(ROLES)
        uid = request.form.get('uid')
        cameras = database.get_cameras(uid)
        sightings = database.get_sightings(uid)
        areas = database.get_areas(uid)
        
        return jsonify({"success": True, 
                        "message": "Markers successfully retrieved.", 
                        "cameras": cameras,
                        "sightings": sightings,
                        "areas": areas})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@main.route("/add-camera", methods=["POST"])
def add_marker():
    """Add a camera marker to the map."""
    try:
        auth.verify_user(ROLES[1:])
        data = request.form.to_dict()
        # clean coordinate formatting
        data['lat'], data['lon'] = [x.strip() for x in data['crds'].split(',')]
        response = database.add_camera(data)
        return jsonify(response)
    except Exception as e:
        print(str(e))
        return jsonify({"success": False, "message": str(e)})

@main.route('/update-camera-status/<camera_id>', methods=['POST'])
def update_camera_status(camera_id):
    try:
        data = request.get_json()
        status = data.get("status")
        response = database.update_status(camera_id, status)
        return jsonify(response)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@main.route("/upload-photo", methods=["POST"])
def upload_photo():
    try:
        auth.verify_user(ROLES[1:])
        files = request.files.getlist('files')
        
        for file in files:
            file_stream = io.BytesIO(file.read())
            media = MediaIoBaseUpload(file_stream, mimetype=file.mimetype)
            file_metadata = {'name': file.filename, 'parents': [UPLOAD_FOLDER_ID]}
            drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()

        return jsonify({"success": True, 'message': "Upload successful."})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
    
@main.route("/add-sighting", methods=["POST"])
def add_sighting():
    """Add a sighting to the map."""
    try:
        auth.verify_user(ROLES[1:])
        data = request.form.to_dict()
        image = request.files.get('image')
        response = database.add_sighting(data, image)
        return jsonify(response)
    except Exception as e:
        print(str(e))
        return jsonify({"success": False, "message": str(e)})

@main.route("/add-area", methods=["POST"])
def add_area():
    """Add a user-defined area to the map."""
    try:
        auth.verify_user(ROLES[1:])
        name = request.form.get('name')
        descripion = request.form.get('description')
        communities = request.form.get('communities').split(',')
        geom_dict = json.loads(request.form.get('geom'))
        geoms = [shape(feature["geometry"]) for feature in geom_dict["features"]]
        geom = unary_union(geoms)
        geom_wkt = from_shape(geom, srid=4326)
        response = database.add_area(name, descripion, geom_wkt, communities)
        return jsonify(response)
    except Exception as e:
        print(str(e))
        return jsonify({"success": False, "message": str(e)})
    
#-----------------------------------------------------------------------

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/add-user', methods=['POST'])
def add_user():
    try:
        uid = request.form.get('uid')
        name = request.form.get('name')
        email = request.form.get('email')
        # Firebase does not automatically register miscellaneous properties
        auth.set_claims(uid, {"role": "viewer"})
        response = database.add_user(uid, name, email)
        return jsonify(response)
    except Exception as e:
        print(f"A fatal exception occurred while adding the user: {str(e)}")
        return jsonify({"success": False, "message": str(e)})
        
@auth_bp.route('/set-role', methods=['POST'])
def set_role():
    auth.verify_user(ROLES[2:])
    uid = request.json.get('uid')
    role = request.json.get('role')
    if role not in ROLES:
        return {'error': 'Invalid role'}, 400

    auth.set_custom_user_claims(uid, {'role': role})
    return {'message': f'Role {role} set for user {uid}'}

#-----------------------------------------------------------------------

community = Blueprint('community', __name__)

@community.route("/get-communities", methods=["POST"])
def get_communities():
    """Get all communities available to the current user."""
    try:
        auth.verify_user(ROLES)
        uid = request.form.get('uid')
        communities = database.get_communities(uid)
        return jsonify({"success": True, "communities": communities})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@community.route('/get-members/<community_code>', methods=['GET'])
def get_members(community_code):
    try:
        members = database.get_members(community_code)
        return jsonify({"members": members, "success": True})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

@community.route('/add-community', methods=['POST'])
def add_community():
    try:
        auth.verify_user(ROLES[1:])
        data = request.form.to_dict()
        image = request.files.get('image')
        response = database.add_community(data, image)
        response['community'] = database.join_community(data['uid'], response['code'])
        return jsonify(response)
    except Exception as e:
        print(str(e))
        return jsonify({"success": False, "message": str(e)})

@community.route('/join-community/<community_code>', methods=['POST'])
def join_community(community_code):
    try:
        auth.verify_user(ROLES)
        uid = request.form.get('uid')
        community = database.join_community(uid, community_code)
        return jsonify({"success": True, "community": community})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})
