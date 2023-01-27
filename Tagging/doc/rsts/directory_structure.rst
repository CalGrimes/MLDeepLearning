Directory structure
==========


Directory structure
----------------

Before starting ReNomTAG, we will explain the directory structure.

Assuming that you run ReNomTAG from ``working_directory``, image datasets must be
aligned according to the following directory structure.

The directory names for the ``public``, ``dataset`` and ``label`` directories must not be changed.

The role of each directory is described below.

- public
    This is the root directory for datasets. The directory name ``public``  must not be changed.

- user1, user2...
    These directories contain image data and user-created label data for each user.
    These directories' names can be changed.

- dataset
    This directory contains image data for tagging.

- label
    User-created label data will be automatically saved into this directory.

- detection
    Detection annotation files (.xml) will be automatically saved into this directory.
    To create a detection dataset for ReNomIMG, copy the xml files in here along with their corresponding image files to the ReNomIMG data folder.

- segmentation
    Segmentation annotation files (.png) will be automatically saved into this directory.
    To create a segmentation dataset for ReNomIMG, copy the png files in here along with their corresponding image files to the ReNomIMG data folder.


.. code-block:: shell

    working_directory # Current Working directory
        │  
        └── public # This name must be `public`.
            │  
            ├── user1 # Dataset for user1. You can use any name for this directory.
            │   ├── dataset # Directory in which image data is placed. This name must be `dataset`.
            │   │   ├── image1.jpg
            │   │   ├── image2.jpg
            │   │   ├── ...
            │   │   └── imageN.jpg
            │   └── label # Directory to which tag data will be output. This name must be `label`.
            |       ├── detection # Directory to which detection tag data will output. The folder name must be set to `detection`.
            |       │   ├── image1.xml **To use detection data in ReNomIMG, please copy the xml files in here to the cReNomIMG data folder.**
            │       |   ├── image1.xml
            │       |   ├── image2.xml
            │       |   ├── ...
            │       |   ├── imageN.xml
            |       └── segmentation # Directory to which segmentation tag data will output. The folder name must be set to `segmentation`.
            |           ├── png # **To use segmentation data in ReNomIMG, please copy the files in the "png" folder to ReNomIMG data folder.**
            |           |   ├── class_map.txt # Mapping between class id and class name.
            │           |   ├── image1.png
            │           |   ├── image2.png
            │           |   ├── ...
            │           |   └── imageN.png
            |           └── xml
            |               ├── image1.xml
            |               ├── image2.xml
            |               ├── ...
            |               └── imageN.xml
            │  
            ├── user2 # Dataset for user2
            │   │  
           ...   ...
            │  
            └── userN
                ├── dataset
                │   ├── image_car1.jpg
                │   └── image_car2.jpg
                └── label
                    ├── ...


Provide image data
----------------

Please place the image data into the ``dataset`` directory.

ReNomTAG is only able to load file names with halfwidth-alphanumeric
(0-9, a-z, A-Z) and under-bar (_) characters. Filenames with, for example, hyphen (-), asterisk(*), etc
cannot be loaded.

ReNomTAG supports images with ".jpeg", ".jpg", ".png", or ".bmp" file extensions.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


