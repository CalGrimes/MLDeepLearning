Installation
=============

Requirements
------------

- Browser: Google Chrome
- Python 3.5


**Python modules**

- xmltodict==0.11.0
- setuptools==39.2.0
- glob2==0.6
- lxml==4.3.3
- bottle==0.12.13
- pytest==3.5.0
- Pillow==5.4.1
- beautifulsoup4==4.7.1
- WebTest==2.0.29
- watchdog==0.8.3

**For building the web app**

- Node.js >= 10.6.0


Install by pip
--------------

- Linux(Ubuntu) OS: You can install ReNomTAG via the following pip3 command.

.. code-block:: shell

    pip3 install https://grid-devs.gitlab.io/ReNomTAG/bin/renom_tag-1.3b3-py3-none-any.whl


Install from source
-------------------

.. code-block:: shell

    # Clone the ReNomTAG repository
    git clone https://github.com/ReNom-dev-team/ReNomTAG.git

    # In the ReNomTAG direcotry
    cd ReNomTAG
    pip install -r requirements.txt
    python setup.py build
    pip install -e .

