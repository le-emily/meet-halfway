# Meet Halfway

When we spend time with our friends and family, we don’t really care what we’re doing as long as we’re hanging out with the people we love. Meet Halfway saves you the trouble of choosing what to do when you just want to spend time with someone. When you want to hang out with a friend, Meet Halfway takes your locations, and using Yelp and Google APIs, provides points of interest that are within reasonable distance to both of you. You’ll save time, trouble, and even gas, all while getting closer to your friends.

Technologies

   Backend: Python, Flask, PostgreSQL, SQLAlchemy
   Frontend: JavaScript, jQuery, AJAX, Jinja2, Bootstrap, HTML5, CSS3
   APIs: Google Maps, Yelp

Setup

   Install PostgreSQL (Mac OSX)

   Clone or fork this repo:

      https://github.com/emilyle265/meet-halfway.git

   Launch and activate a virtual environment

      $ virtualenv env
      $ source env/bin/activate

   Install Python 2.7

   pip install requirements
        
      $ pip install -r requirements.txt

   Create the database

      $ createdb meethalfway
      $ python -i model.py
         >>> db.create_all()
      $ psql meethalfway
         meethalfway=# INSERT INTO status(status_type) VALUES ('accept')
         meethalfway=# INSERT INTO status(status_type) VALUES ('decline')

   Launch server

      $ python server.py

   View app at:
    
      http://localhost:5000/

Test it out!

   Register as two new user to:
   
      - search a midpoint between two locations 
      
      - invite registered users to meet at a restaurant of your choosing

     
