import os
import pprint
import zipfile
import copy
	
emptyScanDict = { 
    'category': 'dicom',
    'files': [],
    'sessionInfo': {
        'Accession #': {'label': 'Acession #', 'value': []},
        'AcqDate': {'label': 'Acq. Date', 'value': []}, 
        'Age': { 'label': "Age", 'value': ['-100']},
        'Format': { 'label': "Format", 'value': ['DICOM']},
        'Gender': { 'label': "Gender", 'value': ['de-identified']},
        'Handedness': { 'label': "Handedness", 'value': ['none']},
        'Scan': { 'label': "Scan", 'value': ['']},
        'Scanner': { 'label': "Scanner", 'value': ['']},
        'SessionID': { 'label': "Session ID", 'value': ['XNATImageViewerDemo']},
        'experiments': "XNATImageViewerDemo",
        'prepend': '',
        'projects': "XNATImageViewerDemo",
        'subjects': "XNATImageViewerDemo",
        'type': { 'label': "type", 'value': ['MPRAGE']} 
        },
    'thumbnailImageSrc' : ''
}



emptySlicerDict = { 
'Name': '',
'Size': '',
'URI': '',
'cat_ID' : '',
'category': 'Slicer',
'collection': 'Slicer',
'file_content': '',
'file_format' : '',
'file_tags': '',
'files': [],
'sessionInfo': {
    'Accession #': {'label': 'Acession #', 'value': []},
    'AcqDate': {'label': 'Acq. Date', 'value': []}, 
    'Age': { 'label': "Age", 'value': ['-100']},
    'Format': { 'label': "Format", 'value': ['']},
    'Gender': { 'label': "Gender", 'value': ['de-identified']},
    'Handedness': { 'label': "Handedness", 'value': ['none']},
    'Scan': { 'label': "Scan", 'value': ['']},
    'Scanner': { 'label': "Scanner", 'value': ['']},
    'SessionID': { 'label': "Session ID", 'value': ['XNATImageViewerDemo']},
    'experiments': "XNATImageViewerDemo",
    'prepend': '',
    'projects': "XNATImageViewerDemo",
    'subjects': "XNATImageViewerDemo",
    'type': { 'label': "type", 'value': ['']} 
    },
    'thumbnailImageSrc' : ''
}




def printDicts(_dict):
    dictStr = ''
    for key in _dict:
        dictStr += '\nvar demoScan_' + key + ' = {'
        for subKey in _dict[key]:
            subVal = _dict[key][subKey]

            subValStr = ''
            if type(subVal) == dict:
                subValu
            dictStr += "\n\t'%s':%s,"%(subKey,  )
        dictStr += '\n}\n'

    print dictStr


    
def main():


    scans = {}
    slicer = {}

    
    #------------------------------------
    # MAIN PARAMS
    #------------------------------------
    scanPath = './scans'
    slicerPath = './Slicer'

    
    #------------------------------------
    #  WALK THROUGH SCANS
    #------------------------------------   
    for root, dirs, files in os.walk(scanPath):
        for f in files:
            if f.endswith('dicom') or f.endswith('dcm'):
                scanKey = root.rsplit('scans')[1].split('/')[1]
                if not scanKey in scans:
                    scans[scanKey] = copy.deepcopy(emptyScanDict)
                fileUri = os.path.join(root, f).replace('./', '../sample-data/')
                scans[scanKey]['files'].append(fileUri)
                scans[scanKey]['sessionInfo']['Scan']['value'] = [scanKey]





    #------------------------------------
    #  WALK THROUGH SLICER FILES
    #------------------------------------   
    for root, dirs, files in os.walk(slicerPath):
        for f in files:
            if f.endswith('mrb'):
                fileUri = os.path.join(root, f).replace('./Slicer', '../sample-data/Slicer')
                slicerKey = f.split('.')[0]
                if not slicerKey in slicer:
                    slicer[slicerKey] = copy.deepcopy(emptySlicerDict)

                #
                # Unzip the .mrb to its own path
                #
                extractPath = os.path.join(root, f.split('.')[0])
                zip = zipfile.ZipFile(fileUri)
                zip.extractall(extractPath)

                #
                # Track all of the .mrb's contents
                #
                thumbImg = None
                mrbFiles = []
                for subRoot, subDirs, subFiles in os.walk(extractPath):
                    for subFile in subFiles:
                        subFileUri = os.path.join(subRoot, subFile).replace('./Slicer', '../sample-data/Slicer')
                        mrbFiles.append(subFileUri)
                        if subFile.endswith('.png') and not thumbImg:
                            thumbImg = subFileUri


                #
                # Write the needed key-value pairs.
                #
                slicer[slicerKey]['Name'] = f.split('.')[0]
                slicer[slicerKey]['URI'] = fileUri
                slicer[slicerKey]['files'] = mrbFiles
                slicer[slicerKey]['thumbnailImageSrc'] = thumbImg
                #slicer[slicerKey]['sessionInfo']['Scan']['value'] = [slicerKey]



    scanArr = [val for key, val in scans.iteritems()]
    scanStr = pprint.pformat(scanArr)
    scanStr = 'var XNAT_IMAGE_VIEWER_DEMO_SCANS = ' + scanStr + '\n\n'

    slicerArr = [val for key, val in slicer.iteritems()]
    slicerStr = pprint.pformat(slicerArr)
    slicerStr = "var XNAT_IMAGE_VIEWER_DEMO_SLICER = " + slicerStr


    
    #------------------------------------
    #  Write strings to file
    #------------------------------------       
    text_file = open("XNAT_IMAGE_VIEWER_DEMO_DATA.js", "w")
    text_file.write(scanStr + slicerStr)
    text_file.close()
    
    print "DONE"

    
if __name__ == "__main__":
    main()


