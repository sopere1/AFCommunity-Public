"""Defines database read/write operations."""

#!/usr/bin/env python

#-----------------------------------------------------------------------
# database.py
#-----------------------------------------------------------------------

# cloudinary configuration
import cloudinary
import cloudinary.uploader

#-----------------------------------------------------------------------

import string
import json
from sqlalchemy.exc import IntegrityError
from geoalchemy2.shape import from_shape, to_shape
from geoalchemy2.functions import ST_Intersects
from shapely.geometry import Point, mapping
from dateutil import parser
from models import Session, Users, Cameras, Sightings, GeoAreas, Communities
from models import UserCommunities, CameraCommunities, SightingCommunities, GeoAreaCommunities

#-----------------------------------------------------------------------

"""Helper Functions."""

def to_dict(instance, exclude=None):
    exclude = exclude or []
    result = {}

    for c in instance.__table__.columns:
        if c.name in exclude:
            continue

        value = getattr(instance, c.name)

        # Handle spatial POINT field: crds
        if c.name == "crds" and value is not None:
            point = to_shape(value)
            # output lat, lon as string for consistency
            value = f"{point.y}, {point.x}"
        elif c.name in ("date", "date_placed") and value is not None:
            value = value.isoformat()

        result[c.name] = value

    return result

def gen_join_code(length):
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

#-----------------------------------------------------------------------

"""Read operations for the database."""

#-----------------------------------------------------------------------
# Section: Camera Traps
#-----------------------------------------------------------------------

def get_cameras(uid):
    """Gets all cameras that the given user has access to."""
    try:
        with Session() as session:
            query = session.query(Cameras).join(
                CameraCommunities, Cameras.id == CameraCommunities.id
            ).join(
                UserCommunities, UserCommunities.code == CameraCommunities.code
            ).filter(UserCommunities.uid == uid)

            data = query.all()
            cameras = [to_dict(camera) for camera in data]
            return cameras
    except Exception as e:
        return {"success": False, "message": str(e)}
    
    except Exception as e:
        return {"success": False, "message": str(e)}

#-----------------------------------------------------------------------
# Section: Wildlife Sightings
#-----------------------------------------------------------------------

def get_sightings(uid):
    """Gets all wildlife sightings that the given user has access to."""
    try:
        with Session() as session:
            query = session.query(Sightings).join(
                SightingCommunities, Sightings.id == SightingCommunities.id
            ).join(
                UserCommunities, UserCommunities.code == SightingCommunities.code
            ).filter(UserCommunities.uid == uid)

            data = query.all()
            sightings = [to_dict(sighting) for sighting in data]
            return sightings
    except Exception as e:
        return {"success": False, "message": str(e)}
    
    except Exception as e:
        return {"success": False, "message": str(e)}

#-----------------------------------------------------------------------
# Section: Geographic Areas
#-----------------------------------------------------------------------

def get_areas(uid):
    """Gets all geographic areas available to the current user."""
    try:
        with Session() as session:
            query = session.query(GeoAreas).join(
                GeoAreaCommunities, GeoAreas.id == GeoAreaCommunities.id
            ).join(
                UserCommunities, UserCommunities.code == GeoAreaCommunities.code
            ).filter(UserCommunities.uid == uid)
            
            areas = query.all()
            
            results = []
            for area in areas:
                geom = mapping(to_shape(area.geom))
                
                cameras = session.query(Cameras).filter(
                    ST_Intersects(Cameras.crds, area.geom)
                ).all()
                
                sightings = session.query(Sightings).filter(
                    ST_Intersects(Sightings.crds, area.geom)
                ).all()

                species_counter = {}
                observer_counter = {}
                hour_bins = [0] * 24

                for sighting in sightings:
                    species = sighting.species
                    species_counter[species] = species_counter.get(species, 0) + 1

                    observer = sighting.observer
                    observer_counter[observer] = observer_counter.get(observer, 0) + 1

                    local_hour = local_hour = sighting.date.hour
                    hour_bins[local_hour] += 1

                results.append({
                    "name": area.name,
                    "description": area.description,
                    "geom": geom,
                    "numCameras": len(cameras),
                    "numSightings": len(sightings),
                    "numSpecies": len(species_counter),
                    "speciesDist": species_counter,
                    "observerDist": observer_counter,
                    "hourBins": hour_bins
                })
                
            return results
        
    except Exception as e:
        return {"success": False, "message": str(e)}

#-----------------------------------------------------------------------
# Section: Communities
#-----------------------------------------------------------------------

def get_communities(uid, code=None):
    """Gets all communities that the given user is a member of."""
    try:
        with Session() as session:
            query = session.query(Communities).join(
                UserCommunities, Communities.code == UserCommunities.code
            ).filter(UserCommunities.uid == uid)

            if code:
                query = query.filter(Communities.code == code)

            data = query.all()
            communities = [to_dict(community) for community in data]
            return communities
    except Exception as e:
        return {"success": False, "message": str(e)}
    
    except Exception as e:
        return {"success": False, "message": str(e)}

def get_members(code):
    with Session() as session:
        members = (
            session.query(Users.name, Users.email)
            .join(UserCommunities, UserCommunities.uid == Users.uid)
            .filter(UserCommunities.code == code)
            .all()
        )

        return [{"name": m.name, "email": m.email} for m in members]

#-----------------------------------------------------------------------

"""Write operations for the database."""

#-----------------------------------------------------------------------
# Section: Users
#-----------------------------------------------------------------------

def get_info(uid):
    """Gets the user's info from their uid."""
    try:
        with Session() as session:
            query = session.query(
                Users
            ).filter_by(
                uid=uid
            )
            data = query.first()
            return data
        
    except Exception as e:
        return {"success": False, "message": str(e)}
    
def add_user(uid, name, email):
    """Adds a user with specified uid, name, and email."""
    try:
        with Session() as session:
            user = Users(
                uid = uid,
                name = name, 
                email = email
            )
            session.add(user)
            session.commit()
            
            print(f'User {name} is being added with uid {uid}.')
            return {"success": True, "message": "User added."}
    
    except IntegrityError as e:
        return {"success": False, "message": "This user has already been registered."}
    except Exception as e:
        return {"success": False, "message": str(e)}
    
#-----------------------------------------------------------------------
# Section: Camera Traps
#-----------------------------------------------------------------------

def add_camera(data):
    """Adds a camera trap with specified data."""
    try:
        with Session() as session:
            owner = get_info(data['uid']).name
            # create geometry with location data
            point = Point(data['lon'], data['lat'])
            crds_val = from_shape(point, srid=4326)
            # clean date/time format
            dt_aware = parser.isoparse(data['datetime'])
            # correct status
            status = data["next"] + ',' + data["daysAhead"]

            camera = Cameras(
                owner = owner,
                site = data['site'],
                crds = crds_val,
                status = status,
                date = dt_aware,
                camera_id = data['camera_id'],
                type = data['type'],
                perc = data['perc'],
                mem = data['mem'],
                lock = data['lock'], 
                comments = data['comment']
            )
            
            session.add(camera)
            session.flush()

            # add to join table for community access
            for code in data.get("communities").split(','):
                join_access = CameraCommunities(
                    id = camera.id,
                    code = code
                )
                session.add(join_access)

            session.commit()
            
            print('A camera is being added.')
            return {"success": True, "message": "Camera added."}
    
    except IntegrityError as e:
        return {"success": False, "message": "This camera has already been registered."}
    except Exception as e:
        print(str(e))
        return {"success": False, "message": str(e)}

def update_status(id, status):
    """Updates the camera's status to status with camera_id id."""
    try:
        with Session() as session:
            # parse the id
            cam, date_str = id.split('-', 1)
            date = parser.isoparse(date_str)
            
            camera = session.query(
                Cameras
            ).filter_by(
                camera_id=cam, date=date
            ).first()
            
            if not camera:
                return {"success": False, "message": "Camera not found"}
            camera.status = status
            session.commit()
            return {"success": True, "message": f"Updated camera {id} status to {status}"}
        
    except Exception as e:
        return {"success": False, "message": str(e)}
    
#-----------------------------------------------------------------------
# Section: Wildlife Sightings
#-----------------------------------------------------------------------

def add_sighting(data, image):
    """Adds a wildlife sighting with specified data."""
    try:
        with Session() as session:
            upload_result = cloudinary.uploader.upload(image)
            url = upload_result.get("secure_url")
            owner = get_info(data['uid']).name
            # create geometry with location data
            crds = json.loads(data['crds'])
            lat, lon = crds['lat'], crds['lon']
            point = Point(lon, lat)
            crds_val = from_shape(point, srid=4326)
            # clean date/time format
            dt_aware = parser.isoparse(data['datetime'])

            sighting = Sightings(
                title = data['title'],
                owner = owner,
                observer = data['observer'],
                crds = crds_val,
                date = dt_aware,
                species = data['species'],
                number = data['number'],
                type = data['type'],
                url = url,
                comments = data['comments']
            )
            session.add(sighting)
            session.flush()

            # add to join table for community access
            for code in data.get("communities").split(','):
                join_access = SightingCommunities(
                    id = sighting.id,
                    code = code
                )
                session.add(join_access)

            session.commit()
            
            print('A sighting is being added.')
            return {"success": True, "message": "Sighting added."}
    
    except IntegrityError as e:
        print(str(e))
        return {"success": False, "message": "This sighting has already been registered."}
    except Exception as e:
        print(str(e))
        return {"success": False, "message": str(e)}

#-----------------------------------------------------------------------
# Section: Geographic Areas
#-----------------------------------------------------------------------

def add_area(name, description, geom, communities):
    """Adds a wildlife sighting with specified data."""
    try:
        with Session() as session:
            area = GeoAreas(
                name = name,
                description = description,
                geom = geom
            )
            session.add(area)
            session.flush()

            # add to join table for community access
            for code in communities:
                join_access = GeoAreaCommunities(
                    id = area.id,
                    code = code
                )
                session.add(join_access)

            session.commit()
            
            print('A user-defined area is being added.')
            return {"success": True, "message": "Area added."}
    
    except IntegrityError as e:
        print(str(e))
        return {"success": False, "message": "This area has already been registered."}
    except Exception as e:
        print(str(e))
        return {"success": False, "message": str(e)}

#-----------------------------------------------------------------------
# Section: Communities
#-----------------------------------------------------------------------
    
def add_community(data, image):
    """Adds a community with specified data."""
    try:
        with Session() as session:
            upload_result = cloudinary.uploader.upload(image)
            url = upload_result.get("secure_url")
            owner = get_info(data['uid']).name
            code = gen_join_code(12)

            community = Communities(
                code = code,
                owner = owner,
                name = data['name'],
                description = data['description'],
                imageUrl = url
            )
            session.add(community)
            session.commit()
            
            print('A community is being added.')
            return {"success": True, "code": code, "message": "Community added."}
    
    except IntegrityError as e:
        print(str(e))
        return {"success": False, "message": "This community has already been registered."}
    except Exception as e:
        print(str(e))
        return {"success": False, "message": str(e)}

def join_community(uid, code):
    """Adds a user to a community."""
    try:
        with Session() as session:
            # check if the user is already in the community
            existing = session.query(UserCommunities).filter_by(uid=uid, code=code).first()
            if existing:
                raise IntegrityError(f"User {uid} is already a member of community {code}.")

            join = UserCommunities(uid=uid, code=code)
            session.add(join)
            session.commit()
            
            return get_communities(uid, code)[0]

    except Exception as e:
        print(str(e))
        return {"success": False, "message": str(e)}
