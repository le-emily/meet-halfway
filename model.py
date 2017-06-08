"""Models and database functions for MeetHalfway project."""

from flask_sqlalchemy import SQLAlchemy
import bcrypt

db = SQLAlchemy()
##############################################################################
# Model definitions

class User(db.Model):
    """User of MeetHalfway website"""

    __tablename__ = "user"

    user_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)

    addresses = db.relationship("Address",
                           secondary="user_address_association")

    def __repr__(self):
        return "<User Name: %s>" % (self.name)


class Invitations(db.Model):
    """Invitations details."""

    __tablename__ = "invitations"

    invitation_id = db.Column(db.Integer, autoincrement=True, primary_key=True)

    sender_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.user_id'))
    status_id = db.Column(db.Integer, db.ForeignKey('status.status_id'))
    
    sender = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])
    status = db.relationship("Status", foreign_keys=[status_id])

    # latitude = db.Column(db.Float)
    # longitude = db.Column(db.Float)
    
    business_name = db.Column(db.String(100), nullable=False)
    business_address = db.Column(db.String(100), nullable=False)

    data = db.Column(db.DateTime)
    time = db.Column(db.DateTime)

    def __repr__(self):
        if not self.status:
            return "<Invitation Details: %s %s>" % (self.sender, self.receiver)
        else:
            return "<Invitation Details: %s %s %s>" % (self.sender, self.receiver, self.status)


class Status(db.Model):
    """Invitation status."""

    __tablename__ = "status"

    status_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    status_type = db.Column(db.String(50), nullable=False)

    def __repr__(self):
        return "<Invitation Status %s>" % (self.status_type)


class Address(db.Model):
    """User addresses."""

    __tablename__ = "address"

    address_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    address_type = db.Column(db.String(50))
    street_address = db.Column(db.String(100), nullable=False)
    zipcode = db.Column(db.String(25), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    # country = db.Column(db.String(50), nullable=False) 

    # Connect User and Address through WalkerDogs using secondary
    users = db.relationship("User",
                           secondary="user_address_association")

    def __repr__(self):
        # removed self.city, fix error before putting it back in
        return "<Address: %s, %s, %s %s>" % (self.address_type, self.street_address, self.zipcode, self.city)


class UserAddress(db.Model):
    """Association table for User and Address. Necessary if one user has multiple addresses."""

    __tablename__ = "user_address_association"
 
    user_address_id =  db.Column(db.Integer, autoincrement=True, primary_key=True)

    user_id =  db.Column(db.Integer, db.ForeignKey('user.user_id'))
    address_id = db.Column(db.Integer, db.ForeignKey('address.address_id'))

    user = db.relationship("User", foreign_keys=[user_id])
    address = db.relationship("Address", foreign_keys=[address_id])

    def __repr__(self):
        return "<User address %d>" % (self.user, self.address)

    
##############################################################################
# Helper functions

# def fill_sample_data():
#     """ Fill database with sample data to start with """

#     # Users
#     user1 = User(name="User1", email="user1@gmail.com", password=bcrypt.hashpw("password", bcrypt.gensalt(9)), 
#         address="1234 Hackbright Way")

#     user2 = User(name="User2", email="user2@gmail.com", password=bcrypt.hashpw("password", bcrypt.gensalt(9)), 
#         address="1234 Hackbright Way")

#     db.session.add(user1)
#     db.session.add(user2)
#     db.session.commit()


def connect_to_db(app):
    """Connect the database to our Flask app."""

    # Configure to use our PstgreSQL database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql:///meethalfway'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.app = app
    db.init_app(app)

if __name__ == "__main__":
    # As a convenience, if we run this module interactively, it will leave
    # you in a state of being able to work with the database directly.

    from server import app
    connect_to_db(app)
    print "Connected to DB."