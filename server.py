from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension

# import secrets
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress

import requests

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

    #Get form variables
    # pull user submission from "name" attribute
    name = request.form.get("name")
    email = request.form.get("email")
    password = request.form.get("password")
    street_address = request.form.get("street_address")
    zipcode = request.form.get("zipcode")
    city = request.form.get("city")
    country = request.form.get("country")

    # instantiate User
    new_user = User(name=name, email=email, password=password, street_address=street_address, zipcode=zipcode, city=city, country=country)
    check_existence = User.query.filter_by(email=new_user.email).all()

    if check_existence:
        flash("User already exists.")
        return redirect("/register")


    # add and commit to session
    db.session.add(new_user)
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
    """Show form for midpoint search."""

    return render_template("search_midpoint.html")


@app.route("/search_midpoint", methods=["GET"])
def yelp_get_request():
    # need to get longitude lattitude from google maps api mid location that user selects

    """Use extracted location data to render businesses (latitude/longitude coordinates)."""

    access_token = 'AAPEv204eMRHn-7LRWL-HNO90iZrKf3F9HXdbSgLRMdmeKV2oAxDmWOa8RrVTv063jhO1ckEIeUGslnnN6w4AYNVp_PWFdEOM189VZf_XBt-hnMPDhpSS2YamjMSWXYx'

    url = 'https://api.yelp.com/v3/businesses/search'

    headers = {'Authorization': 'bearer %s' % access_token}

    # need lat/long to get midpoint
    location_a = request.args.get("location_a")
    location_b = request.args.get("location_b")

    parameters = {'location_a': location_a,
                    'location_b': location_b}

    response = requests.get(url=url, parameters=parameters, headers=headers)

    business_response = response.json()
    
    business_results = business_response['businesses']

    businesses = []
    for business in business_results:
        businesses.append(business.name)

    return redirect("/search_midpoint")


# @app.route("/search_midpoint", method=["GET"])
# def google_maps_midpoint():
#     """Get google maps midpoint from two given locations."""


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = False

    connect_to_db(app)
 
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")