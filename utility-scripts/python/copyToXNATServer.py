import sys
import os
import shutil
from datetime import datetime
import time
 
import convertDemo



def main():

    #----------------------------
    # Convert Demo.html to VM and popup.html
    #----------------------------     
    convertDemo.main()

    

    #----------------------------
    #  Params
    #----------------------------  
    imageViewerHome = os.environ.get('XNATIMAGEVIEWER_HOME')
    apacheHome = os.environ.get('CATALINA_HOME')
    apacheXnat = apacheHome + '/webapps/xnat'

 
    origins= {
        'scripts':  imageViewerHome + '/src/main/scripts/viewer/xiv',
        'images' : imageViewerHome + '/src/main/images/viewer',
        'vm' : imageViewerHome + '/src/main/templates/screens/XImgView.vm',
        'hook' : imageViewerHome + '/src/main/templates/screens/xnat_imageSessionData/actionsBox/ViewInXImgView.vm',        
    }

    targets = {
        'scripts' : apacheXnat + '/scripts/viewer/xiv',
        'images' : apacheXnat + '/images/viewer',
        'vm' : apacheXnat + '/templates/screens/XImgView.vm',
        'hook' : apacheXnat + '/templates/screens/xnat_imageSessionData/actionsBox/ViewInXImgView.vm',
    }



    print (time.strftime("%I:%M:%S"))
    #----------------------------
    #  Copy folders and/or files
    #----------------------------
    for key, src in origins.iteritems():



        dst = targets[key]

        print "\n\nSRC: %s\nDST: %s"%(src, dst)
        
        #
        # For directories
        #
        if not os.path.isfile(src):
            # Delete existing directory
            if os.path.exists(dst):
                shutil.rmtree(dst)
            # Copy the file
            shutil.copytree(src, dst)

        #
        # For files
        #
        else:
            if os.path.basename(src).startswith('.'):
                continue
            # Delete existing file
            if os.path.exists(dst):
                os.remove(dst)
            # Make the directory to the file
            dirName = os.path.dirname(dst)
            if not os.path.exists(dirName):
                os.makedirs(dirName)
            # copy the file
            shutil.copy(src, dst)
            
    print '\n\nCompleted at: '+ time.strftime("%H:%M:%S") + '\n\n'
           

if __name__ == "__main__":
    main()

