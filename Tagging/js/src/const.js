export const TASK_ID = {
  CLASSIFICATION: 0,
  DETECTION: 1,
  SEGMENTATION: 2
};

export const ERROR = {
  SERVER_CONNECTION: {
    code: 0,
    message: "ERROR\n\n Failed to connect server"
  },
  DUP_FILE: {
    code: 2,
    message:
      'ERROR\n\n The following files could not be loaded, because there are files which have the same name but different extensions.  \n\n Only one file can be loaded with the same filename base and the priority is   \n\n "jpg > jpeg > png > bmp"   \n\n Please change the filename of: \n'
  },
  UNDEF_FILE: {
    code: 3,
    message:
      "ERROR\n\n The following filenames are unavailable, which could not be loaded. \n\n Please change the filename of: \n"
  },
  MAKE_DIR: {
    NG_PATH: {
      code: 110,
      message:
        "ERROR\n\n The current directory is unavailable. \n Please choose another directory. \n\n Load again to start."
    },
    NG_USERNAME: {
      code: 113,
      message:
        "ERROR\n\n The username is unavailable. \n Please use only halfwidth-alphanumeric (0-9, a-z, A-Z) and under-bar (_). \n\n Load again to start."
    }
  },
  DELETION: {
    XML: {
      code: 120,
      message: "Xml deletion failed!"
    },
    PNG: {
      code: 130,
      message: "Png deletion failed!"
    }
  }
};

export const IMG_STATUS = {
  LOADING: {
    code: 105,
    message: "Loading images..."
  },
  NO_IMG: {
    code: 100,
    message: "No images found."
  }
};

export const NOTICE = {
  MAKE_DIR: {
    INITIAL: {
      code: 115,
      message:
        'NOTICE\n\n No folder named "public" in the current directory.\n Would you like to create the directories?'
    },
    SUCCESS: {
      code: 111,
      message:
        "NOTICE\n\n Successfully created directories!\n\n Load again to start."
    }
  },
  DELETION: {
    XML: {
      SUCCESS: {
        code: 121,
        message: "Xml deletion successful!"
      }
    },
    PNG: {
      SUCCESS: {
        code: 131,
        message: "Png deletion successful!"
      }
    }
  }
};
