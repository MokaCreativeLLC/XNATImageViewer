# test

import sys
import os
import shutil
from datetime import datetime
 
        
        
        
def main():


    origins= {
        'scripts': "../",
        'images' : "../../../images/viewer/",
        'vm' : "../../../xnat-templates/screens/XIViewer.vm",
    }

    targets = {
        'scripts' : '../../../../../../xnat_builder_1_6dev/plugin-resources/webapp/xnat/scripts/viewer/',
        'images' : '../../../../../../xnat_builder_1_6dev/plugin-resources/webapp/xnat/images/viewer/',
        'vm' : '../../../../../../xnat_builder_1_6dev/plugin-resources/webapp/xnat-templates/screens/XIViewer.vm',
    }

    
    #----------------------------
    #  Construct a src - dst map
    #----------------------------
    sdMap = {}
    for key in origins:

        #
        # Inventory all files in src directories (i.e. scripts and images)
        #
        if not os.path.isfile(origins[key]):
            for root, dirs, files in os.walk(origins[key]):
               for f in files:
                   src = os.path.join(root, f)
                   dst = os.path.join(root.replace(origins[key], targets[key]), f)
                   sdMap[f] = {
                       'src': src,
                       'dst': dst
                   }

        #
        # Inventory all files as files         
        #
        else:
             print "need to append", (origins[key])
             src = origins[key]
             dst = os.path.join(src.replace(origins[key], targets[key]))
             f = os.path.basename(origins[key])

             
        # add to map
        sdMap[f] = {
            'src': src,
            'dst': dst
        }

        


    #----------------------------
    #  Copy files
    #----------------------------
    import shutil
    excludeStrings = [".git"]
    for key in sdMap:
        dir = os.path.dirname(sdMap[key]['dst'])
        
        #
        # Construct non-existent directories         
        #        
        if not os.path.exists(dir):
            print "\n'%s' doesn't exist.  Making it.\n"%(dir)
            os.makedirs(dir)


        #
        # Filter anything that needs to be excluded
        #
        keepFile = True
        for excluder in excludeStrings:
            if excluder in sdMap[key]['src']:
                print "Skipping file '%s'"%(sdMap[key]['src'])
                keepFile = False

        if keepFile:
            print ("Copying %s to\n\t %s")%(sdMap[key]['src'], sdMap[key]['dst'])
            shutil.copy(sdMap[key]['src'], sdMap[key]['dst'])
             
           

if __name__ == "__main__":
    main()

