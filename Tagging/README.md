# ReNomTAG

A tagging tool for creating object detection annotation labels.

## Version

v1.3b3

- http://renom.jp/packages/renomtag/index.html


## Changes

v1.3b2 => v1.3b3

- Fixed tagging area bug

Please refer to 'Change Log' at renom.jp URL below for complete change history:

- http://renom.jp/packages/renomtag/rsts/change_log.html


## Recommended Environment

- OS: Ubuntu 16.04
- Browser: Google Chrome
- Python: 3.5

## Requirements

- Browser: Google Chrome
- Python 3.5

For required python modules please refer to requirements.txt.

## Installation

### Install via pip

ReNomTAG can be installed via a pip wheel package or from the source code.

The wheel package is provided at:

    https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-VERSION-py3-none-any.whl

(`VERSION` should be replaced with actual version number, e.g. 0.0.1)

You can install the wheel package with the pip3 command::

```
$ pip3 install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-1.3b3-py3-none-any.whl
```

The wheel package contains pre-built js files so that you don't have to build them manually.


#### Wheels for past versions

- [v1.3b2](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.3b2-py3-none-any.whl)
- [v1.3b1](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.3b1-py3-none-any.whl)
- [v1.3b0](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.3b0-py3-none-any.whl)
- [v1.2b1](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.2b1-py3-none-any.whl)
- [v1.2b0](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.2b0-py3-none-any.whl)
- [v1.1b0](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.1b0-py3-none-any.whl)
- [v1.0.2](https://renom.jp/docs/downloads/wheels/renom_tag/renom_tag-1.0.2-py3-none-any.whl)


### Install from source

To install ReNomTAG from source, first clone the ReNomTAG repository.
```
git clone https://github.com/ReNom-dev-team/ReNomTAG.git
```

Move to the ReNomTAG/js/ directory and use the following command to install the node packages.
```
cd ReNomTAG/js/
npm install
```

Python version 3.6 is required to install ReNomTAG with the commands below.
Go to the ReNomTAG root directory and install ReNomTAG and its requirements.
```
cd ../
pip install -r requirements.txt
python setup.py build
pip install -e .
```

#### Build Javascript (for developers)

Build the js files with following command.

```
$ cd js
$ npm run start
```

## How to use

### Create working directory for the ReNomTAG app

A working directory is needed to run the ReNomTAG app.
Note that the directory structure is fixed. Please confirm the details at the following page.
http://renom.jp/packages/renomtag/rsts/directory_structure.html


For instance:
 ```
 working_directory # Current Working directory
     │  
     └── public # This folder must be named `public`.
         │  
         └── user1 # Dataset for user1. You can use any name for this directory.
             ├── dataset # Directory containing images for tagging. The folder name must be set to `dataset`.
             │   ├── image1.jpg
             │   ├── image2.jpg
             │   ├── ...
             │   └── imageN.jpg
             └── label # Directory to which tag data will output. The folder name must be set to `label`.
                 ├── detection # Directory to which detection tag data will output. The folder name must be set to `detection`.
                 │   ├── image1.xml
                 │   ├── ...
                 │   └── imageN.xml
                 └── segmentation # Directory to which segmentation tag data will output. The folder name must be set to `segmentation`.
                     ├── png # **If you want to use segmentation tag in ReNomIMG, please copy all of the files in the "png" folder to ReNomIMG data folder.**
                     │    ├── class_map.txt # Mapping between class id and class name.
                     │    ├── image1.png
                     │    ├── ...
                     │    └── imageN.png
                     └── xml
                          ├── image1.xml
                          ├── ...                       
                          └── imageN.xml
 ```

The directories above can be made using the following commands:
 ```
mkdir ~/working_directory
cd ~/working_directory
mkdir public
mkdir public/user1
mkdir public/user1/label
mkdir public/user1/dataset
 ```


### How to run ReNomTAG

Once installed, you can run ReNomTAG as follows.

```
$ python -m renom_tag
```

You can also use the `renom_tag` command installed by wheel.

```
$ renom_tag
```
Use your web browser to access the address and port listed in the console.


### Debugging (for developers)

You can also use webpack-dev-server for debugging.
Before starting the dev-server with the following commands,
make sure that the ReNomTAG app is running in the working_directory (see ## How to run the app).

For the first time:
```
$ cd js
$ npm run start
```
From the second time onward:
```
$ cd js
$ npm run dev
```

### Sample Dataset

If you want to try ReNomTAG but don't have a particular dataset to use, the following dataset is available. Please download it and place the photos in the "public/'user'/dataset" folder.

- Cats and Dogs Classification  
https://github.com/JDonini/Cats_Dogs_Classification

- O. M. Parkhi, A. Vedaldi, A. Zisserman, C. V. Jawahar
Cats and Dogs  
IEEE Conference on Computer Vision and Pattern Recognition, 2012
Bibtex  
http://www.robots.ox.ac.uk/~vgg/data/pets/


## License

“ReNomTAG” is provided by GRID inc., as subscribed software. By downloading ReNomTAG, you are agreeing to be bound by our ReNom Subscription agreement between you and GRID inc.
To use ReNomTAG for commercial purposes, you must first obtain a paid license. Please contact us or one of our resellers.  If you are an individual wishing to use ReNomTAG for academic, educational and/or product evaluation purposes, you may use ReNomTAG royalty-free.
The ReNom Subscription agreements are subject to change without notice. You agree to be bound by any such revisions. You are responsible for visiting www.renom.jp to determine the latest terms to which you are bound.
