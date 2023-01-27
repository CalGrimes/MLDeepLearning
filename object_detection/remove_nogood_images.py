import os
import glob


if os.path.exists('images/'):
    count = 0
    for file in glob.glob('images/*.xml'):
        with open(file, 'r') as f:
            if 'Nogood' in f.readlines():
                print(file)
                os.remove(file)
                os.remove(file.split(".xml")[0]+".jpg")
                count+= 1
                
    print("{} files removed".format(count))