"""
Defines the database schema. Creates a SessionMaker object to
use in database.py with the specified schema.
"""

#!/usr/bin/env python

#-----------------------------------------------------------------------
# models.py
#-----------------------------------------------------------------------

import sqlalchemy, sqlalchemy.orm
from sqlalchemy import DateTime, UniqueConstraint
from geoalchemy2 import Geometry

#-----------------------------------------------------------------------

#-----------------------------------------------------------------------

"""
Creates a SessionMaker object containing references to the database 
schema. Implements the database schema if the tables do not already 
exist.
"""

Base = sqlalchemy.orm.declarative_base()

#-----------------------------------------------------------------------

class Users(Base):
    __tablename__ = 'users'
    
    id = sqlalchemy.Column(sqlalchemy.Integer, 
                                primary_key=True)
    uid = sqlalchemy.Column(sqlalchemy.String(30), 
                            nullable=False,
                            unique = True)
    name = sqlalchemy.Column(sqlalchemy.String(30), 
                             nullable=False)
    email = sqlalchemy.Column(sqlalchemy.String(100),
                            nullable=False,
                            unique=True)
    
#-----------------------------------------------------------------------

class Cameras(Base):
    # cameras are uniquely identified by the date and time of placement and ID
    __tablename__ = 'cameras'
    __table_args__ = (
        UniqueConstraint('camera_id', 'date', name='uq_camera_id_date'),
    )
    
    id = sqlalchemy.Column(sqlalchemy.Integer,
                           primary_key=True)
    owner = sqlalchemy.Column(sqlalchemy.String(30),
                              nullable=False)
    site = sqlalchemy.Column(sqlalchemy.String(30),
                                  nullable=False)
    crds = sqlalchemy.Column(Geometry(geometry_type="POINT", srid=4326),
                             nullable=False)
    status = sqlalchemy.Column(sqlalchemy.String(255),
                               nullable=False)
    date = sqlalchemy.Column(DateTime(timezone=True), 
                             nullable=False)
    camera_id = sqlalchemy.Column(sqlalchemy.String(30),
                                  nullable=False)
    type = sqlalchemy.Column(sqlalchemy.String(30),
                                    nullable=False)
    perc = sqlalchemy.Column(sqlalchemy.Integer,
                                nullable=False)
    mem = sqlalchemy.Column(sqlalchemy.String(30),
                                 nullable=False)
    lock = sqlalchemy.Column(sqlalchemy.String(30))
    comments = sqlalchemy.Column(sqlalchemy.String(255),
                                 nullable=True)

#-----------------------------------

class Sightings(Base):
    # sightings are uniquely identified by the observer, species, date, and time
    __tablename__ = 'sightings'
    __table_args__ = (
        UniqueConstraint('observer', 'species', 'date', name='uq_sight_obs_spe_date'),
    )
    
    id = sqlalchemy.Column(sqlalchemy.Integer,
                           primary_key=True)
    title = sqlalchemy.Column(sqlalchemy.String(30),
                              nullable=False)
    owner = sqlalchemy.Column(sqlalchemy.String(30),
                              nullable=False)
    observer = sqlalchemy.Column(sqlalchemy.String(30),
                                 nullable=False)
    crds = sqlalchemy.Column(Geometry(geometry_type="POINT", srid=4326),
                             nullable=False)
    date = sqlalchemy.Column(DateTime(timezone=True), 
                                    nullable=False)
    species = sqlalchemy.Column(sqlalchemy.String(255),
                                nullable=False)
    number = sqlalchemy.Column(sqlalchemy.Integer,
                               nullable=False)
    type = sqlalchemy.Column(sqlalchemy.String(255),
                                nullable=False)
    url = sqlalchemy.Column(sqlalchemy.String(255),
                            nullable=False)
    comments = sqlalchemy.Column(sqlalchemy.String(255),
                                 nullable=True)

#-----------------------------------

class GeoAreas(Base):
    __tablename__ = 'geoareas'
    __table_args__ = (
        UniqueConstraint('name', name='uq_name'),
    )
    
    id = sqlalchemy.Column(sqlalchemy.Integer,
                           primary_key=True)
    name = sqlalchemy.Column(sqlalchemy.String(30),
                             nullable=False)
    description = sqlalchemy.Column(sqlalchemy.String(255),
                                    nullable=False)
    geom = sqlalchemy.Column(Geometry('POLYGON', srid=4326), 
                             nullable=False)
    
#-----------------------------------------------------------------------

class Communities(Base):
    __tablename__ = 'communities'
    
    code = sqlalchemy.Column(sqlalchemy.String(30),
                             primary_key=True)
    owner = sqlalchemy.Column(sqlalchemy.String(30),
                              nullable=False)
    name = sqlalchemy.Column(sqlalchemy.String(30),
                             nullable=False)
    description = sqlalchemy.Column(sqlalchemy.String(255),
                             nullable=False)
    imageUrl = sqlalchemy.Column(sqlalchemy.String(255),
                                 nullable=False)

#-----------------------------------------------------------------------

class UserCommunities(Base):
    __tablename__ = 'user_communities'

    uid = sqlalchemy.Column(sqlalchemy.String(30), 
                            sqlalchemy.ForeignKey('users.uid'), 
                            primary_key=True, 
                            nullable=False)
    code = sqlalchemy.Column(sqlalchemy.String(30), 
                             sqlalchemy.ForeignKey('communities.code'), 
                             primary_key=True,
                             nullable=False)

class CameraCommunities(Base):
    __tablename__ = 'camera_communities'

    id = sqlalchemy.Column(sqlalchemy.Integer, 
                           sqlalchemy.ForeignKey('cameras.id'), 
                           primary_key=True, 
                           nullable=False)
    code = sqlalchemy.Column(sqlalchemy.String(30), 
                             sqlalchemy.ForeignKey('communities.code'), 
                             primary_key=True,
                             nullable=False)

class SightingCommunities(Base):
    __tablename__ = 'sighting_communities'

    id = sqlalchemy.Column(sqlalchemy.Integer, 
                           sqlalchemy.ForeignKey('sightings.id'), 
                           primary_key=True, 
                           nullable=False)
    code = sqlalchemy.Column(sqlalchemy.String(30), 
                             sqlalchemy.ForeignKey('communities.code'), 
                             primary_key=True,
                             nullable=False)

class GeoAreaCommunities(Base):
    __tablename__ = 'geoarea_communities'

    id = sqlalchemy.Column(sqlalchemy.Integer, 
                           sqlalchemy.ForeignKey('geoareas.id'), 
                           primary_key=True, 
                           nullable=False)
    code = sqlalchemy.Column(sqlalchemy.String(30), 
                             sqlalchemy.ForeignKey('communities.code'), 
                             primary_key=True,
                             nullable=False)

#-----------------------------------------------------------------------

_engine = sqlalchemy.create_engine(_DATABASE_URL)

# if the tables do not exist, create them
Base.metadata.create_all(_engine)

Session = sqlalchemy.orm.sessionmaker(bind=_engine)
