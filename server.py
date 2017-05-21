from jinja2 import StrictUndefined
from flask import Flask, render_template, request, flash, redirect, session, jsonify
from flask_debugtoolbar import DebugToolbarExtension
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress
import requests
import sys 
import json
import pdb
import pprint

app = Flask(__name__)
app.jinja_env.undefined = StrictUndefined
app.jinja_env.auto_reload = True

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

    user = User.query.filter_by(email=email).first()

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


@app.route("/invitations")
def invitations_list():
    # invitation = Invitations.query.all()
    # check each invitation, if accept, make green, if decline make grey.
    user_emails = []
    users = User.query.all()

    for user in users:
        user_emails.append(user.email)

    return render_template("invitations.html", user_emails=user_emails)


# @app.route("/search_midpoint.json", methods=["GET"])
def get_midpoint_coordinates():
    """Get lat/lng coordinates from script."""

    lat = request.args.get("lat")
    lng = request.args.get("lng")

    coord = {'lat': lat, 'lng': lng}
    
    return coord


@app.route("/yelp_search", methods=["POST"])
def get_yelp_access_token(): 
    """Get yelp businesses around midpoint coordinates."""

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

    # result = resp.json()['businesses']
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