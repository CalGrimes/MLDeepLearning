import os
import glob

if os.path.exists('images'):
    for jpgfile in glob.glob('images/*.jpg'):
        filename = jpgfile.split(".jpg")[0]
        if not (os.path.exists(filename+'.xml')):
            os.remove(jpgfile)
            print("File Removed: ", jpgfile)