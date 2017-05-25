from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress
import requests
import sys 
import os
import json
import pdb
import pprint

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'my super secret key blah blah'
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


@app.route("/register", methods=["POST"])
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

    # .first() will pull into memory, look into this
    existing_address = Address.query.filter_by(street_address=street_address).first()

    if not existing_address:
        new_address = Address(address_type=address_type, street_address=street_address, city=city, zipcode=zipcode)
        db.session.add(new_address)

    user_address = UserAddress(user_id=new_user.user_id, address_id=new_address.address_id)
    
    db.session.add(user_address)
    db.session.commit()
    flash("Added.")

    return redirect("/")


@app.route("/login", methods=["GET"])
def login_form():
    """Show form for user login"""
    
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login_process():
    """Process login."""
    
    # Get form variables
    email = request.form["email"]
    password = request.form["password"]

    # using this user to send current logged in user as sender
    user = User.query.filter_by(email=email).first()

    sender = user.email
    # create a session to hold onto current user for invitations
    session['sender'] = sender
    
    logged_in_user = user.email 

    session['logged_in_user'] = logged_in_user

    print logged_in_user

    if not user:
        flash("No such user")
        return redirect("/login")

    if user.password != password:
        flash("Incorrect password")
        return redirect("/login")

    session["user_id"] = user.user_id

    flash("Logged in")
    return redirect("/search_midpoint")


@app.route("/logout")
def logout():
    """Log out."""

    del session["user_id"]
    flash("Logged Out.")

    return redirect("/")

     
@app.route("/search_midpoint", methods=["GET"])
def search_midpoint():
    """Render for map search."""

    return render_template("search_midpoint.html")


@app.route("/friends", methods=["GET"])
def friends_list():
    """Show list of friends."""

    user_emails = []

    users = User.query.all()

    for user in users:
        user_emails.append(user)

    return render_template("friends_list.html", user_emails=user_emails)

# IN PROGRESS
@app.route("/invitation_receipient_email", methods=["GET"])
def check_invitation_email(invitation_recipient_email):
    """Check validity and get email of invite recipient."""

    check_valid_recipient_email = User.query.filter_by(email=invitation_recipient_email).first()
    print check_valid_recipient_email

    if not check_valid_recipient_email:
        return None

    recipient = check_valid_recipient_email

    return recipient


@app.route("/invitations", methods=["POST"])
def make_invitations():
    """Make Invitations."""
    invitation_recipient_email = request.form.get("email")

    receiver = check_invitation_email(invitation_recipient_email)

    if receiver:
        sender = session.get('sender')
        s = User.query.filter_by(email=sender).first()
        # status = request.form.get("invitation_response")
        response_to_invitation = Invitations(sender=s, receiver=receiver)
        db.session.add(response_to_invitation)
        db.session.commit()
        response = {'recipient_name' : receiver.name, 'status': "Ok"}
        return jsonify(response)
    else:
        response = {'status' : "bad user!!"}
        return jsonify(response)

    # if status=="decline":
        # disable/gray out the invitation

@app.route("/invitations", methods=["POST"])
def respond_to_invitations():
    """Respond to Invitations."""
    # how do i know which one i'm responding to? 
    invitation_response = request.form.get("selection")

    print "response_to_invitation"
    print response_to_invitation

    # HOW DO I ADD STATUS BACK INTO THE INSTANCE????
    response_to_invitation.status = invitation_response

    db.session.commit()
    return redirect("/invitations")


@app.route("/invitations", methods=["GET"])
def invitations_form():
    """Show form for user signup."""
    # check logged in user
    logged_in_user = session.get('logged_in_user')
    # print "This is the logged_in_user variable!!! WORKS!!!"
    print logged_in_user

    # import pdb;pdb.set_trace()

    l = User.query.filter_by(email=logged_in_user).first()
    print "THIS IS l.email!!!!!!"
    # check all invitations that match logged in user's email
    invitations = Invitations.query.filter_by(receiver=l).all()

    # AttributeError: 'Invitations' object has no attribute 'status_type'
    # NEED TO ADD IN STATUS TYPE, IN FUNCTION BELOW
    # if invitations:
    return render_template("invitations.html", invitations=invitations)
    # query database for current logged in user
    
    # return "Nothing!"
# END IN PROGRESS


def get_yelp_access_token(): 
    """Get yelp businesses around midpoint coordinates."""

    # UNSAFE! need to put app_id and app_secret in config file
    app_id = 'CCbMJ0qYlYAB3GJ8DA-pFg'
    app_secret = 'pgbsg6iN7p8Sg767MFJjmmW0cia3Cad9X8IGJjZLCNIMUFbKzgb45MCvGdAapxlM'

    data = {'grant_type': 'client_credentials',
            'client_id': app_id,
            'client_secret': app_secret}

    token = requests.post('https://api.yelp.com/oauth2/token', data=data)

    access_token = token.json()['access_token']

    return access_token


@app.route("/yelp_search.json", methods=["GET"])
def yelp_business_search():
    lat = request.args.get("lat")
    lng = request.args.get("lng")
 
    access_token = get_yelp_access_token()

    url = 'https://api.yelp.com/v3/businesses/search'
    headers = {'Authorization': 'bearer %s' % access_token}
    params = {'limit': 10, 'term': 'Restaurant', 'sort_by': 'rating', 'latitude': lat, 'longitude': lng}

    resp = requests.get(url=url, params=params, headers=headers)

    result = resp.json()['businesses']

    # for r in result:
    #     result_list.append(r.get("name"))
    return jsonify(result)


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = True

    connect_to_db(app)
 
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")