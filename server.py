
from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress
import requests
import sys
import os
import json
import random
# import bcrypt
# from flask.ext.bcrypt import generate_password_hash, check_password_hash
from functools import wraps
google_maps_api_key = os.environ['GOOGLE_KEY']
yelp_app_id = os.environ['YELP_APP_ID']
yelp_app_secret = os.environ['YELP_APP_SECRET']



app = Flask(__name__)
# bcrypt = Bcrypt(app)
app.jinja_env.undefined = StrictUndefined
app.jinja_env.auto_reload = True

os.urandom(24)

app.secret_key = "t)6r)3s5^w)i9kahs(=^u$0-djb*6!@gs93qlfnjxh_^!gi@&_"

@app.route("/", methods=["GET"])
def index():
    """Render welcome page."""
    return render_template("welcome.html")


@app.route("/register", methods=["GET"])
def register_form():
    """Show form for user signup."""

    return render_template("register.html")

# need to change route
@app.route("/", methods=["GET", "POST"])
def process_registration():
    """Process registration."""

    name = request.form.get("name")
    email = request.form.get("email")
    password = request.form.get("password")
    street_address = request.form.get("street_address")
    zipcode = request.form.get("zipcode")
    city = request.form.get("city")
    address_type = request.form.get("address_type")

    # Encode password
    # hashed = bcrypt.generate_password_hash(password)

    existing_user = User.query.filter_by(email=email).first()

    # Check new user and log in 
    if not existing_user:
        new_user = User(name=name, email=email, password=password)
        session['current_user'] = email
        db.session.add(new_user)
        db.session.commit()
        flash("You are now registered and logged in!")

    existing_address = Address.query.filter_by(street_address=street_address).first()

    if not existing_address:
        new_address = Address(address_type=address_type, street_address=street_address, city=city, zipcode=zipcode)
        db.session.add(new_address)
        user_address = UserAddress(user_id=new_user.user_id, address_id=new_address.address_id)
        db.session.add(user_address)
        db.session.commit()
    
    flash("Added")

    return redirect("/search_midpoint")


# Login Required Decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not 'current_user' in session:
            return redirect('/')
        return f(*args, **kwargs)
    return decorated_function


@app.route("/login", methods=["GET", "POST"])
def login_process():
    """Process login."""

    # Get form variables
    user_email = request.form["email"]
    user_password = request.form["password"]

    try:
        user = User.query.filter_by(email=user_email).first()
        print "USER", user
        print "user.password", user.password 
        print "user_password", user_password
        if user.password == user_password:
            session["current_user"] = user_email
            flash("Logged in")
            return redirect("/search_midpoint")
        else:
            flash("Incorrect password")
            return redirect("/")
    except:
        flash("No user with that email")
        return redirect("/")

@app.route("/logout")
def logout():
    """Log out."""

    del session["current_user"]

    flash("Logged out")

    return redirect("/")


@app.route("/search_midpoint", methods=["GET"])
@login_required
def search_midpoint():
    """Render for map search."""

    data=[{'name':'restaurant'}, {'name':'shopping'}, {'name':'bar'}, {'name':'cafe'}]

    return render_template("search_midpoint.html", data=data, google_maps_api_key=google_maps_api_key)


@app.route("/invitation_receipient_email", methods=["GET"])
def check_invitation_email(invitation_recipient_email):
    """Check validity and get email of invited recipient. Will get passed into make_invitations."""

    check_valid_recipient_email = User.query.filter_by(email=invitation_recipient_email).first()

    if not check_valid_recipient_email:
        return None

    recipient = check_valid_recipient_email

    return recipient


@app.route("/add_invitation", methods=["POST"])
def make_invitations():
    """Make Invitations instances with null status'."""

    invitation_recipient_email = request.form.get("email")
    business_address = request.form.get("businessAddress")
    business_name = request.form.get("businessName")

    session["business_address"] = business_address
    session["business_name"] = business_name

    receiver = check_invitation_email(invitation_recipient_email)

    if receiver:
        sender = session.get("current_user")
        if receiver != sender:
            s = User.query.filter_by(email=sender).first()
            response_to_invitation = Invitations(sender=s,
                                                receiver=receiver,
                                                business_address=business_address,
                                                business_name=business_name)
            db.session.add(response_to_invitation)
            db.session.commit()
            response = {"recipient_name" : receiver.name, "status": "Ok"}
            return jsonify(response)
    else:
        response = {"status" : "bad user!!"}
        return jsonify(response)


@app.route("/invitations", methods=["GET"])
@login_required
def invitations_form():
    """Show list of invitations received."""
    current_user = session.get("current_user")

    receiver = User.query.filter_by(email=current_user).first()

    invitations = Invitations.query.filter_by(receiver=receiver).all()

    # list all invites sent by user and their status
    sender = session.get("current_user")
    s = User.query.filter_by(email=current_user).first()
    sent_invitations = Invitations.query.filter_by(sender=s).all()


    return render_template("invitations.html",
                            invitations=invitations,
                            sent_invitations=sent_invitations)


@app.route("/invitations", methods=["POST"])
def respond_to_invitation():
    """Respond to Invitations."""
    invitation_response = request.form.get("selection")

    find_invitation = Invitations.query.filter_by(invitation_id=request.form.get("invitation_id")).first()

    if find_invitation:
        if invitation_response == "accept":
            find_invitation.status_id = 1
        elif invitation_response == "decline":
            find_invitation.status_id = 2
        else:
            pass

    if find_invitation:
        if delete_invitation:
            db.session.delete(find_invitation)


    db.session.commit()

    print find_invitation

    response = {"response": invitation_response}

    return jsonify(response)


def get_yelp_access_token():
    """Get yelp access token."""

    data = {"grant_type": "client_credentials",
            "client_id": yelp_app_id,
            "client_secret": yelp_app_secret}

    token = requests.post("https://api.yelp.com/oauth2/token", data=data)

    access_token = token.json()["access_token"]

    print(access_token)

    return access_token


# @app.route('/<invitation_id>/delete', methods=['POST'])
# def delete_invitation(invitation_id):
#     """Delete view that takes an id to delete invitation from database."""
#     invitation = Record.query.get_or_404(id)
#     db.session.delete(r)
#     db.session.commit()
#     return redirect(url_for('index'))


@app.route("/yelp_search.json", methods=["GET"])
def yelp_business_search():
    """Get yelp businesses around midpoint coordinates."""
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius = request.args.get("radius")

    if int(radius) > 40000:
        radius = '40000'
    elif int(radius) < 100:
        radius = '100'
    else:
        pass

    venue_type = request.args.get("venue_type")

    # Default venue to restaurants if not indicated
    if not str(venue_type):
        venue_type = "restaurant"

    access_token = get_yelp_access_token()

    url = "https://api.yelp.com/v3/businesses/search"
    headers = {"Authorization": "bearer %s" % access_token}
    params = {"radius": radius, "limit": 10, "term": str(venue_type), "sort_by": "rating", "latitude": lat, "longitude": lng}

    resp = requests.get(url=url, params=params, headers=headers)

    result = resp.json()["businesses"]

    return jsonify(result)

@app.route("/yelp_reviews.json", methods=["GET"])
def yelp_reviews():
    """Get business reviews."""
    business_id = request.args.get("business_id")

    access_token = get_yelp_access_token()

    headers = {"Authorization": "bearer %s" % access_token}
    url = 'https://api.yelp.com/v3/businesses/' + business_id +'/reviews'

    resp = requests.get(url=url, headers=headers)

    result = resp.json()["reviews"]

    return jsonify(result)

if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")