# meet-halfway

Setup

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

    Launch server

        $ python server.py

    View app at:
    
        http://localhost:5000/

Test it out!

    Register as a new user to:
        - search a midpoint between two locations 
        - add friends
        - send an invite to meet at a restaurant of your choosing
