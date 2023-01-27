Introduction
============

What is ReNomTAG?
----------------
.. image:: /_static/image/introduction.png

**ReNomTAG** is a GUI application for creating image recognition training data.
In general, training data is required for training machine learning models when using supervised learning techniques.
This training data is the correct, or ground truth, label to which the model’s output is compared.
However, this data is usually prepared manually by people, requiring significant effort and time to create sufficiently large datasets.

ReNomTAG was created to reduce the time and effort involved in creating this training data.

ReNomTAG provides a GUI that has been designed for natural and simple user operation.
Users can create training data efficiently and quickly using only a mouse and shortcut keys.
The data can then be read into the image recognition model development application ReNomIMG for training models.


What is image recognition?
----------------
Image recognition is a type of pattern recognition.
Features are extracted from images that contain objects, and these features are then correlated with the objects that are actually in the image.
By doing this we can teach machine learning models that, for example, images that contain a particular type of feature pattern are actually images of cats.


What is training data?
----------------
Labeled data that is used to tell a machine learning model the information “this region of the image is a cat”, for example.
This data is the ground truth data corresponding to the images that become inputs to machine learning models.
