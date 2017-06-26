Simple image annotation tool

This is the code for a simple image annotation tool.
It is meant to run on Bluemix, with the back-end implemented
using Node-RED (nodered-flow1/2/3.json). It stores the annotation
information in a Cloudant database.

To redeploy, create a Node-RED starter app on Bluemix,
copy the node-red flow information into your node-red
instance, and copy the front end code (in the public folder)
to your project's public code folder on bluemix. You will
need to configure the node-red nodes to use your own cloudant
database. You should create a database called image_selection
in your cloudant service. You should copy the
getAnnotatedImageJSON.json contents into a new design
document for that database.

Contact rtomsett@uk.ibm.com for details