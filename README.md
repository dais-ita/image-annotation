Simple image annotation tool

This is the code for a simple image annotation tool.
It is meant to run on Bluemix, with the back-end implemented
using Node-RED (nodered-flow1,2,3). It store the annotation
information in a Cloudant database.

To redeploy, create a Node-RED starter app on Bluemix,
copy the node-red flow information into your node-red
instance, and copy the front end code (in the public folder)
to your project's public code folder on bluemix.