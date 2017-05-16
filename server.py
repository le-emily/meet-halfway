from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension

# import secrets
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress

import requests

# to get js into python
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

    # 1. 
    new_user = User(name=name, email=email, password=password)

    # 2. new address, make a new address object with its address fields--address_type, street, etc.
    # check if address exists, make new one or get from database

    # Check if address already exists, case sensitive
    existing_address = Address.query.filter_by(street_address=street_address).first()

    # If address does not exist, add.
    if not existing_address:
        new_address = Address(address_type=address_type, street_address=street_address, city=city, zipcode=zipcode)

    user_address = UserAddress(user_id=user_id, address_id=address_id)

    # add and commit to session
    db.session.add(new_user)
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
    """Show form for midpoint search."""

    return render_template("search_midpoint.html")


@app.route("/friends", methods=["GET"])
def friends_list():
    """Show list of friends."""

    users = User.query.all()

    return render_template("friends_list.html", users=users)


@app.route("/friends/<int:user_id>")
def friend_detail(user_id):
    """Show info about user."""

    users = User.query.get(user_id)
    print users

    # UndefinedError: 'users' is undefined
    return render_template("friends_list.html", users=users)




@app.route("/search_midpoint", methods=["POST"])
def get_search_parameter():
    # need to get longitude lattitude from google maps api mid location that user selects

    """Use extracted location data to render businesses (latitude/longitude coordinates)."""

    # access_token = 'AAPEv204eMRHn-7LRWL-HNO90iZrKf3F9HXdbSgLRMdmeKV2oAxDmWOa8RrVTv063jhO1ckEIeUGslnnN6w4AYNVp_PWFdEOM189VZf_XBt-hnMPDhpSS2YamjMSWXYx'

    # # need to get latitude and longitude cooridnates from script.js
    # url = 'https://api.yelp.com/v3/businesses/search?'

    # headers = {'Authorization': 'bearer %s' % access_token}

    # # read json and reply
    # data = request.get_json()
    # result = ''

    # for item in data:
    #     result += str(item['l']) + '\n'

    # print result

    # latitude = float(result[0])
    # longitude = float(result[1])

    # print latitude 
    # print longitude 

    # parameters = {'term': "restaurant", 'latitude': latitude, 'longitude': longitude, 'radius_filter': '10'}

    # response = requests.get(url=url, parameters=parameters, headers=headers)

    # business_response = response.json()

    # print business_response

    # print business_response
    
    # business_results = business_response['businesses']

    # businesses = []

    # for business in business_results:
    #     businesses.append(business.name)

    # second attempt
    r = requests.get("/search_midpoint")
    coordinates_json = r.json()
    lat = coordinates_json['_lat']
    lng = coordinates_json['_lng']

    print lat 
    print lng

    return redirect("/search_midpoint")


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = False

    connect_to_db(app)
 
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")