#bcrypt pipe 

The purpose of this module is to generate hashes of a list of plaintext passwords easily and
then to compare ciphertext of the result with the original plaintext. 

There are two options when using this file:
* To generate ciphertext from plaintext passwords e.g. username,plaintext --> username,ciphertext
* To compare ciphertext with plaintext passwords e.g. username1,plaintext === username1,ciphertext

##Command line usage:

To generate ciphertext

`cat users.csv | node bcrypt-pipe.js > passwords.csv`

e.g. users.csv

```
bruce,hello123
wayne,password123
```

To compare ciphertext

`cat passwords.csv | node bcrypt-pipe.js`

Assuming that the cipher for bruce is correct and wayne's is wrong. 

It will return:
```
bruce: OK!
wayne: Mismatch 
```

Format of input

The input and output has the same format, which is common separated fields like a csv:

```
username1,password1
username2,password2
username3,password3
```

Disclaimer: This was my first attempt using streams within node.js