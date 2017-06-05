
    # def __init__(self, name, email, plaintext_password, addresses):
    #     self.name = name
    #     self.email = email
    #     self.password = plaintext_password
    #     self.authenticated = False
    #     self.addresses = addresses
 
    # @hybrid_property
    # def password(self):
    #     return self._password
 
    # @password.setter
    # def set_password(self, plaintext_password):
    #     self._password = bcrypt.generate_password_hash(plaintext_password)
 
    # @hybrid_property
    # def is_correct_password(self, plaintext_password):
    #     return bcrypt.check_password_hash(self.password, plaintext_password)
