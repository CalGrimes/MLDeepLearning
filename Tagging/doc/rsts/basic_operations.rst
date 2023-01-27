Basic Operations
==========


Run server
----------------
For running ReNomTAG, please use the following command in your ``working directory``.

.. code-block:: shell

    renom_tag

This command has the following options.

.. code-block:: shell

    # Run with port 8081
    renom_tag --port 8081

Then type the following URL into your web browser.

.. image:: /_static/image/basic_operations01.png

The ``public`` directory will be loaded and following screen will be displayed.

.. image:: /_static/image/basic_operations02.png
   :align: center

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Select Dataset
----------------

After starting the application, select the dataset for tagging from the list on the left.
If the list is not displayed, click the icon in the upper left to access the list and select your dataset.
This icon can be used to switch between datasets at any time.

.. image:: /_static/image/basic_operations11.png
   :align: center

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Select Tagging Mode
----------------

ReNomTAG provides modes for creating both object detection tags (bounding boxes) and semantic segmentation labels (pixel-level annotations).
Please select the mode you will use by clicking on the corresponding mode name in the upper right.

.. image:: /_static/image/basic_operations03.png
   :align: center


Filter images
~~~~~~~~~~~~~~~~~

You can filter the images to be shown.

- **All** : Show all images.
- **Need Review** : Show images marked neither OK nor NG.
- **No Tags** : Show images with no tags.
- **OK** : Show images marked as ``OK`` by admin user.
- **NG** : Show images marked as ``NG`` by admin user.

.. image:: /_static/image/basic_operations04.png
   :align: center


Add tags or labels to images
~~~~~~~~~~~~~~~~~

Please refer to "4: How to tag" for an explanation of how to apply tags or labels to images.


Add comments to images
~~~~~~~~~~~~~~~~~

You can also add comments to images.
Users in normal mode can view comments but they cannot edit or add them.


.. image:: /_static/image/basic_operations05.png
   :align: center


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Admin mode
----------------

ReNomTAG has two modes of operation, normal mode (default) and Admin mode.
Admin mode has all functions found in normal mode as well as the following functions.

- Add/delete class tags.
- Mark tagged images as ``OK`` or ``NG``.


Enter admin mode
~~~~~~~~~~~~~~~~~

To enter admin mode, please add ``admin`` to the URL as shown below.

.. image:: /_static/image/basic_operations06.png

The title of the page should change to ``Admin``.

.. image:: /_static/image/basic_operations07.png
   :align: center


Add new class tags
~~~~~~~~~~~~~~~~~

If you are in admin mode, you can add new class tags.
To do this, type the new class tag name into the form shown below.

Next, click the ``Add New Tag`` button.

You can also add a shortcut key. The shortcut key can be changed
in either admin or normal mode.

.. image:: /_static/image/basic_operations08.png
   :align: center


Delete class tags
~~~~~~~~~~~~~~~~~

If you are in admin mode, you can also delete existing class tags.
To do this, click the ``Delete Tag List`` button shown in red below.

Next, select the individual tags you would like to delete, and click ``Delete``.

.. image:: /_static/image/basic_operations09.png
   :align: center


Apply marks to images
~~~~~~~~~~~~~~~~~~~~~~~~

Admin mode also provides a marking function.
You can mark tagged images as ``OK`` or ``NG``.

To apply a mark, please click the OK or NG button.

.. image:: /_static/image/basic_operations10.png
   :align: center

After clicking the ``save`` button, the mark will be saved.


Return to normal mode
~~~~~~~~~~~~~~~~~~~

To return to normal mode, please remove ``admin`` from the URL.


~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Use ReNomTAG with multiple users
-------------------------------

You can add multiple user directories under the public folder and
then choose which directory you would like to work on.

.. image:: /_static/image/basic_operations11.png
   :align: center

The image above represents the following directory structure.
There are 4 user directories (Alice, Bob, user1 and user2).

.. code-block:: shell

    working_directory # Current Working directory
        │  
        └── public
            │  
            ├── Alice
            │   ├── dataset
            │   │   ├── image1.jpg
            │   │   ├── ...
            │   │   └── imageN.jpg
            │   └── label
            │       ├── image1.xml
            │       ├── ...
            │       └── imageN.xml
            │  
            ├── Bob
            │   ├── dataset
            │   │   ├── image_car1.jpg
            │   │   ├── ...
            │   │   └── image_carN.jpg
            │   └── label
            │       ├── image_car1.xml
            │       ├── ...
            │       └── image_carN.xml
            │  
            ├── user1
            │   ├── dataset
            │   │   ├── image_person1.jpg
            │   │   ├── ...
            │   │   └── image_personN.jpg
            │   └── label
            │       ├── image_person1.xml
            │       ├── ...
            │       └── image_personN.xml
            │  
            └── user2
                ├── dataset
                │   ├── image_bird1.jpg
                │   └── image_bird2.jpg
                └── label
                    ├── image_bird1.xml
                    └── image_bird2.xml

You can access and work in any user directory.
The data in each directory is not shared with other directories.

.. note::
    The user-separated directories are recognised by ReNomTAG if
    they contain the ``dataset`` and ``label`` sub-directories.


Supported Browsers
-------------------------------

ReNomTAG currently supports Google Chrome.
In some instances, default shortcut keys for Google Chrome may conflict with ReNomTAG shortcut keys.
Please disable the browser shortcut key in order to use the corresponding shortcut in ReNomTAG.
