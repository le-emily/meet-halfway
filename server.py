from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress
import requests
import sys
import os
import json
import random


app = Flask(__name__)
# app.config["SECRET_KEY"] = "my super secret key blah blah"
app.jinja_env.undefined = StrictUndefined
app.jinja_env.auto_reload = True

os.urandom(24)

app.secret_key = "t)6r)3s5^w)i9kahs(=^u$0-djb*6!@gs93qlfnjxh_^!gi@&_"

@app.route("/", methods=["GET"])
def index():

    return render_template("welcome.html")


@app.route("/register", methods=["GET"])
def register_form():
    """Show form for user signup."""

    return render_template("register.html")


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

    existing_user = User.query.filter_by(email=email).first()

    if not existing_user:
        new_user = User(name=name, email=email, password=password)
        db.session.add(new_user)

    existing_address = Address.query.filter_by(street_address=street_address).first()

    if not existing_address:
        new_address = Address(address_type=address_type, street_address=street_address, city=city, zipcode=zipcode)
        db.session.add(new_address)
        user_address = UserAddress(user_id=new_user.user_id, address_id=new_address.address_id)
        db.session.add(user_address)

    db.session.commit()
    flash("Added")

    return redirect("/")


@app.route("/login", methods=["GET", "POST"])
def login_process():
    """Process login."""

    # Get form variables
    email = request.form["email"]
    password = request.form["password"]

    user = User.query.filter_by(email=email).first()
    sender = user.email
    logged_in_user = user.email

    # If user already logged in, redirect -- not working :(
    # if session["logged_in_user"]:
    #     return redirect("/search_midpoint")

    if not user:
        flash("No such user")
        return redirect("/")
    elif user.password != password:
        flash("Incorrect password")
        return redirect("/")
    else:
        # create a session to hold onto current user for invitations
        # sender and logged_in_user are the same thing
        session["sender"] = sender
        session["logged_in_user"] = logged_in_user
        session["user_id"] = user.user_id
        flash("Logged in")

    return redirect("/search_midpoint")

@app.route("/logout")
def logout():
    """Log out."""

    del session["user_id"]
    del session["sender"]
    del session["logged_in_user"]

    flash("Logged out")

    return redirect("/")


@app.route("/search_midpoint", methods=["GET"])
def search_midpoint():
    """Render for map search."""

    data=[{'name':'restaurant'}, {'name':'shopping'}, {'name':'bar'}, {'name':'cafe'}]

    return render_template("search_midpoint.html", data=data)


# @app.route("/friends", methods=["GET"])
# def friends_list():
#     """Show list of friends."""

#     user_emails = []

#     users = User.query.all()

#     for user in users:
#         user_emails.append(user)

#     return render_template("friends_list.html", user_emails=user_emails)

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

    print "BUSINESS ADDRESS"
    print business_address
    print "BUSINESS NAME"
    print business_name

    receiver = check_invitation_email(invitation_recipient_email)

    if receiver:
        sender = session.get("sender")
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
def invitations_form():
    """Show list of invitations received."""
    logged_in_user = session.get("logged_in_user")

    verified_logged_in_user = User.query.filter_by(email=logged_in_user).first()

    invitations = Invitations.query.filter_by(receiver=verified_logged_in_user).all()

    # list all invites sent by user and their status
    sender = session.get("sender")
    s = User.query.filter_by(email=logged_in_user).first()
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

    db.session.commit()

    print find_invitation

    response = {"response": invitation_response}

    return jsonify(response)


def get_yelp_access_token():
    """Get yelp businesses around midpoint coordinates."""

    # UNSAFE! need to put app_id and app_secret in config file
    app_id = "CCbMJ0qYlYAB3GJ8DA-pFg"
    app_secret = "pgbsg6iN7p8Sg767MFJjmmW0cia3Cad9X8IGJjZLCNIMUFbKzgb45MCvGdAapxlM"

    data = {"grant_type": "client_credentials",
            "client_id": app_id,
            "client_secret": app_secret}

    token = requests.post("https://api.yelp.com/oauth2/token", data=data)

    access_token = token.json()["access_token"]

    print(access_token)

    return access_token


@app.route("/yelp_search.json", methods=["GET"])
def yelp_business_search():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    radius = request.args.get("radius")

    if int(radius) > 40000:
        radius = '40000'
    elif int(radius) < 100:
        radius = '100'
    else:
        pass

    # keeping tabs on previous input searches and adding them to options
    venue_type = request.args.get("venue_type")

    access_token = get_yelp_access_token()

    url = "https://api.yelp.com/v3/businesses/search"
    headers = {"Authorization": "bearer %s" % access_token}
    params = {"radius": radius, "limit": 10, "term": str(venue_type) + "restaurant", "sort_by": "rating", "latitude": lat, "longitude": lng}

    resp = requests.get(url=url, params=params, headers=headers)

    result = resp.json()["businesses"]

    return jsonify(result)


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)

    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")
