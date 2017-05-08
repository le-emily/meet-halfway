from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension

import secrets
from model import connect_to_db, db, User, Invitations, Status, Address, UserAddress


app = Flask(__name__)

app.secret_key = "t)6r)3s5^w)i9kahs(=^u$0-djb*6!@gs93qlfnjxh_^!gi@&_"

app.jinja_env.undefined = StrictUndefined

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
    email = request.form.get("email")
    password = request.form.get("password")

    return render_template("register.html", email=email, password=password)


@app.route("/login", methods=["GET"])
def login_form():
    """Show form for user login"""
    
    return render_template("login.html")


@app.route("/login", methods=["POST"])
def login_process():
    # user_email = User.request.get(email).one()

    email = request.form.get("email")
    password = request.form.get("password")

    # user is unique
    user = User.query.filter_by(email=email).first()

    if not user:
        flash("This user does not exist in the databse.")
        return redirect("/login")

    # if user.password != password
    #     flash("Incorrect password.")
    #     return redirect("/login")

    session["user_id"] = user.user_id

    flash("Log in successful!")

    # change redirect?
    return redirect("/login")
#     


if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = False

    connect_to_db(app)
 
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")