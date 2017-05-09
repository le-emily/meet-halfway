from jinja2 import StrictUndefined

from flask import Flask, render_template, request, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension

# import secrets
from model import connect_to_db, db, User, Status, Invitations, Address, UserAddress


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
    # pull user submission from "name" attribute
    name = request.form.get("name")
    email = request.form.get("email")
    password = request.form.get("password")
    address = request.form.get("address")

    # instantiate User
    new_user = User(name=name, email=email, password=password, address=address)
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
    return redirect("/")


@app.route("/logout")
def logout():
    """Log out."""

    del session["user_id"]
    flash("Logged Out.")
    return redirect("/")

     
@app.route("/search_midpoint", methods=["GET"])
def search_midpoint():
    """Search midpoint location."""

    return render_template("search_midpoint.html")


# @app.route("/search_midpoint", methods=["POST"])
# def search_midpoint():
#     """Search midpoint location."""

#     return redirect("/search_midpoint")

if __name__ == "__main__":
    # We have to set debug=True here, since it has to be True at the point
    # that we invoke the DebugToolbarExtension
    app.debug = False

    connect_to_db(app)
 
    # Use the DebugToolbar
    DebugToolbarExtension(app)

    app.run(host="0.0.0.0")