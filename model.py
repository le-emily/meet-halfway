"""Models and database functions for MeetHalfway project."""

from flask_sqlalchemy import SQLAlchemy, ForeignKey

db = SQLAlchemy()
##############################################################################
# Model definitions

class User(db.Model):
    """User of MeetHalfway website"""

    __tablename__ = "user"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(50), nullable=False)

    invitations = relationship("Invitations", backref="user")

class Invitations(db.Model):
    """Invitations details."""

    __tablename__ = "invitations"

    invitation_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    receiver_id = db.Column(db.Integer, db.ForeignKey("user.user_id"))
    status_id = db.Column(db.Integer)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    data = db.Column(db.DateTime)
    time = db.Column(db.DateTime)


class Status(db.Model):
    """Invitation status."""

    __tablename__ = "status"

    status_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    status_type = db.Column(db.String(50), nullable=False)


class Address(db.Model):
    """User addresses."""

    __tablename__ = "address"

    address_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    address_type = db.Column(db.String(50), autoincrement=True, primary_key=True)
    address = db.Column(db.String(100), nullable=False)



class UserAddress(db.Model):
    """Association table for User and Address"""

    __tablename__ = "user_address_association"
 
    user_address_id =  db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id =  db.Column(db.Integer, ForeignKey("user.user_id"))
    address_id = db.Column(db.Integer, ForeignKey("address.address_id"))

    
##############################################################################
# Helper functions

def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PstgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/MeetHalfway'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)

if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print "Connected to DB."