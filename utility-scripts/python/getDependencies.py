import sys
import os
import shutil

        
def main():



    #------------------------------------
    # MAIN PARAMS
    #------------------------------------
    makeBackup = True
    imageViewerHome = os.environ.get('XNATIMAGEVIEWER_HOME')
    rootDir = imageViewerHome + "/src/main/scripts/viewer/utils/ControllerMenu"



    skipContains = [ 'require(' ,  '_' ,  'provide(' , 'exportSymbol(', ')', ';', '>', '(', "'", "}", "{", ',', '=', '|']
    depStrs = ['goog.', 'utils.', 'xiv.', 'X.']



    
    provideStr = ''
    exporter = 'goog.exportSymbol('


    depsByFile = {}
   

    
    #------------------------------------
    #  WALK THROUGH + REPLACE
    #------------------------------------   
    for root, dirs, files in os.walk(rootDir):

       foundDeps = {'GOOG':{}, 'UTILS': {}, 'XIV': {}, 'X':{}}
       for f in files:
           if f.endswith('deps.js') or f.startswith('.'):
               continue

           filename = os.path.join(root, f)
           lines = [line for line in open(filename)]
           
           for line in lines:
               #line = line.replace(' ', '')
               print line
               if 'goog.require(' in line:

                   requireLine = line.strip('goog.require(').replace(')', '').replace("'",'').replace('"', '').replace(';', '').strip()
                   try:
                       foundDeps[requireLine.split('.')[0].upper()][requireLine] += 1
                   except:
                       foundDeps[requireLine.split('.')[0].upper()][requireLine] = 1
                  
               if 'goog.provide(' in line:
                   provideStr = line.strip('goog.provide(').replace(')', '').replace("'",'').replace('"', '').replace(';', '').strip()
               
               for depStr in depStrs:

                   
                   if depStr in line:


                       line = line.strip().strip(';')


                       foundArr =  depStr + line.split(depStr)[1]
                       foundArr = foundArr.rsplit(" ")[0].rsplit('.')

                       skip = False
                       for skipContain in skipContains:
                           if skipContain in foundArr[1]:
                               skip = True
                               break
                       
                       if not skip:
 
                           try:
                               foundDeps[foundArr[0].upper()][foundArr[0] + '.' + foundArr[1]]+=1
                           except:
                               foundDeps[foundArr[0].upper()][foundArr[0] + '.' + foundArr[1]] = 1

           depsByFile[filename]  = {'symbol': provideStr, 'deps': foundDeps}




    requireStr = """/**
 * REPLACE_VAL includes.
 */"""

    includeTypes = {'GOOG': 'Google closure', 'UTILS': 'utils', 'X' : 'XTK', 'XIV':'xiv'}
           

    print "\n\n"
    for filename in depsByFile:
        foundDeps = depsByFile[filename]['deps']
        depList = ''
        for key in foundDeps:
            #print foundDeps[key]
            for key2 in foundDeps[key]:
                if depsByFile[filename]['symbol'] != key2:
                    depList += "\n'" + key2 + "',"
        depList[:-1]


        
        #
        # Goog require print
        #
        googAddStr = 'goog.addDependency(%s, [%s], [%s\n]);'%("'" + filename.replace('../xiv', '../../../xiv') + "'", "'" + depsByFile[filename]['symbol'] + "'", depList) 
        
        print googAddStr + '\n\n'
        for key in foundDeps:
            if len(foundDeps[key])>0:
                print requireStr.replace('REPLACE_VAL', includeTypes[key])
            for key2 in foundDeps[key]:
                if depsByFile[filename]['symbol'] != key2:
                    print "goog.require('" + key2 + "');"
            if len(foundDeps[key])>0:
                print '\n'
        
            
if __name__ == "__main__":
    main()
