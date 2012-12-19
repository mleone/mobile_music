Mobile Music

This is a simple jQuery Mobile / HTML5 App to find local music event information.



RUNNING THE APP IN DEVELOPMENT MODE

Get a Jambase API key by registering at http://developer.jambase.com/

Edit js/mobile-music.js and replace the Jambase API key with your own.

Accessing the static files directly from your browser (via file://) won't work 
because local files are interpreted as having a domain origin of "null." To 
prevent cross domain issues, we need to actually "serve up" the app.  There are
many static file servers that can do this; I've found Python's built-in server 
to be the easiest method:

(assumes you have Python installed)

$ cd /path/to/project/directory
$ python -m SimpleHTTPServer 8000

Then visit http://localhost:8000 to see the app.



DEPLOYING TO GITHUB PAGES

$ git push origin gh-pages

